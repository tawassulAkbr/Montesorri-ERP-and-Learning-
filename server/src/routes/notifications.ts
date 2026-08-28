import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { notFound } from '../utils/errors';
import { notificationToFrontend } from '../utils/serializers';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

notificationRouter.get('/', async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id, role: req.user!.role.toUpperCase() as any },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ notifications: notifications.map(notificationToFrontend) });
});

notificationRouter.patch('/:id/read', async (req, res) => {
  const n = await prisma.notification.findUnique({ where: { id: String(req.params.id) } });
  if (!n || n.userId !== req.user!.id) throw notFound('Notification not found');
  const updated = await prisma.notification.update({
    where: { id: n.id },
    data: { read: true },
  });
  res.json({ notification: notificationToFrontend(updated) });
});

notificationRouter.patch('/read-all', async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, role: req.user!.role.toUpperCase() as any, read: false },
    data: { read: true },
  });
  res.json({ ok: true });
});
