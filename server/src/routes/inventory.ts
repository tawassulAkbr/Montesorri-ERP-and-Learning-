import { Router } from 'express';
import { z } from 'zod';
import type { InventoryCategory, MovementType } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { badRequest, notFound } from '../utils/errors';
import { schoolOf } from '../utils/tenant';
import { inventoryItemToFrontend, inventoryMovementToFrontend } from '../utils/serializers';

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth, requireRole('admin'));

const CATEGORIES = ['stationery', 'cleaning', 'sports', 'furniture', 'medical', 'other'] as const;

const itemSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.enum(CATEGORIES),
  quantity: z.number().int().min(0).max(1_000_000).default(0),
  minStock: z.number().int().min(0).max(100_000).default(0),
  unit: z.string().max(20).optional(),
  location: z.string().max(60).optional(),
});

const moveSchema = z.object({
  type: z.enum(['stock_in', 'stock_out', 'adjust']),
  quantity: z.number().int().min(0).max(1_000_000),
  note: z.string().max(200).optional(),
});

async function actorName(id: string): Promise<string> {
  const admin = await prisma.admin.findUnique({ where: { id }, select: { name: true } });
  return admin?.name ?? 'School Office';
}

// 404 rather than 403 so another tenant's item ids stay unprobeable.
async function ownedItem(schoolId: string, itemId: string) {
  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, schoolId } });
  if (!item) throw notFound('Inventory item not found');
  return item;
}

const query = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

// ─── Stock list ──────────────────────────────────────────────────────────────
inventoryRouter.get('/items', async (req, res) => {
  const schoolId = schoolOf(req);
  const search = query(req.query.search)?.toLowerCase();
  const category = query(req.query.category);

  const items = await prisma.inventoryItem.findMany({
    where: {
      schoolId,
      ...(category && (CATEGORIES as readonly string[]).includes(category)
        ? { category: category.toUpperCase() as InventoryCategory }
        : {}),
      ...(search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { location: { contains: search, mode: 'insensitive' } }] }
        : {}),
    },
    orderBy: { name: 'asc' },
    take: 300,
  });

  res.json({
    items: items.map(inventoryItemToFrontend),
    lowStockCount: items.filter(i => i.quantity <= i.minStock).length,
  });
});

inventoryRouter.get('/low-stock', async (req, res) => {
  const schoolId = schoolOf(req);
  const items = await prisma.inventoryItem.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
    take: 300,
  });
  const low = items.filter(i => i.quantity <= i.minStock).map(inventoryItemToFrontend);
  res.json({ items: low, count: low.length });
});

// ─── Item maintenance ────────────────────────────────────────────────────────
inventoryRouter.post('/items', async (req, res) => {
  const schoolId = schoolOf(req);
  const input = itemSchema.parse(req.body);
  const byId = req.user!.id;
  const byName = await actorName(byId);

  const item = await prisma.$transaction(async tx => {
    const created = await tx.inventoryItem.create({
      data: {
        schoolId,
        name: input.name.trim(),
        category: input.category.toUpperCase() as InventoryCategory,
        quantity: input.quantity,
        minStock: input.minStock,
        unit: input.unit?.trim() || null,
        location: input.location?.trim() || null,
      },
    });
    if (input.quantity > 0) {
      await tx.inventoryMovement.create({
        data: {
          schoolId, itemId: created.id, type: 'STOCK_IN', quantity: input.quantity,
          note: 'Opening stock', byId, byName,
        },
      });
    }
    return created;
  });

  res.status(201).json({ item: inventoryItemToFrontend(item) });
});

// Quantity is deliberately not patchable: every level change goes through /move
// so the movement history stays a complete audit trail.
inventoryRouter.patch('/items/:id', async (req, res) => {
  const schoolId = schoolOf(req);
  const owned = await ownedItem(schoolId, req.params.id);
  const input = itemSchema.partial().omit({ quantity: true }).parse(req.body);

  const item = await prisma.inventoryItem.update({
    where: { id: owned.id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category.toUpperCase() as InventoryCategory } : {}),
      ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
      ...(input.unit !== undefined ? { unit: input.unit.trim() || null } : {}),
      ...(input.location !== undefined ? { location: input.location.trim() || null } : {}),
    },
  });

  res.json({ item: inventoryItemToFrontend(item) });
});

inventoryRouter.post('/items/:id/move', async (req, res) => {
  const schoolId = schoolOf(req);
  const owned = await ownedItem(schoolId, req.params.id);
  const input = moveSchema.parse(req.body);
  const byId = req.user!.id;
  const byName = await actorName(byId);
  const type = input.type.toUpperCase() as MovementType;

  const item = await prisma.$transaction(async tx => {
    // Re-read inside the transaction so two concurrent moves cannot both pass the balance check.
    const current = await tx.inventoryItem.findUniqueOrThrow({ where: { id: owned.id } });

    let next: number;
    if (type === 'STOCK_IN') {
      next = current.quantity + input.quantity;
    } else if (type === 'STOCK_OUT') {
      next = current.quantity - input.quantity;
      if (next < 0) throw badRequest(`Insufficient stock: only ${current.quantity} left`);
    } else {
      next = input.quantity; // ADJUST records a physical count as the new absolute level
    }

    await tx.inventoryMovement.create({
      data: {
        schoolId, itemId: current.id, type, quantity: input.quantity,
        note: input.note?.trim() || null, byId, byName,
      },
    });
    return tx.inventoryItem.update({ where: { id: current.id }, data: { quantity: next } });
  });

  res.json({
    item: inventoryItemToFrontend(item),
    quantity: item.quantity,
    lowStock: item.quantity <= item.minStock,
  });
});

// ─── Movement history ────────────────────────────────────────────────────────
inventoryRouter.get('/movements', async (req, res) => {
  const schoolId = schoolOf(req);
  const itemId = query(req.query.itemId);

  const movements = await prisma.inventoryMovement.findMany({
    where: { schoolId, ...(itemId ? { itemId } : {}) },
    include: { item: { select: { name: true } } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 100,
  });

  res.json({ movements: movements.map(inventoryMovementToFrontend) });
});
