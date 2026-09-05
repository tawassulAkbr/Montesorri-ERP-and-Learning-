import { useMemo, useState } from 'react';
import {
  Package, AlertTriangle, Boxes, ArrowDownToLine, ArrowUpFromLine, Plus, Search, Pencil, ClipboardList,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { cn, INVENTORY_CATEGORY_LABELS, MOVEMENT_TYPE_LABELS } from '@/lib/utils';
import type { InventoryCategory, InventoryItem, MovementType } from '@/types';

const SELECT_CLASS =
  'w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white';

const CATEGORIES = Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[];

const MOVEMENT_STYLE: Record<MovementType, string> = {
  stock_in: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  stock_out: 'bg-red-50 text-red-700 border-red-200',
  adjust: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Add / Edit Item Dialog ───────────────────────────────────────────────────
const ItemDialog: React.FC<{
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
}> = ({ open, item, onClose }) => {
  const { addInventoryItem, updateInventoryItem } = useData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('stationery');
  const [quantity, setQuantity] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [unit, setUnit] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Re-seed the form whenever a different row is opened for editing.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = item?.id ?? 'new';
  if (open && seededFor !== seedKey) {
    setSeededFor(seedKey);
    setName(item?.name ?? '');
    setCategory(item?.category ?? 'stationery');
    setQuantity(String(item?.quantity ?? 0));
    setMinStock(String(item?.minStock ?? 0));
    setUnit(item?.unit ?? '');
    setLocation(item?.location ?? '');
    setError('');
  }
  if (!open && seededFor !== null) setSeededFor(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('Enter the item name.'); return; }
    const min = Number(minStock);
    if (!Number.isInteger(min) || min < 0) { setError('Minimum stock must be a whole number.'); return; }

    setSubmitting(true);
    try {
      if (item) {
        await updateInventoryItem(item.id, {
          name: name.trim(), category, minStock: min,
          unit: unit.trim() || undefined, location: location.trim() || undefined,
        });
      } else {
        const opening = Number(quantity);
        if (!Number.isInteger(opening) || opening < 0) { setError('Opening stock must be a whole number.'); setSubmitting(false); return; }
        await addInventoryItem({
          name: name.trim(), category, quantity: opening, minStock: min,
          unit: unit.trim() || undefined, location: location.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={16} className="text-[#006B5D]" />
            {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item
              ? 'Stock levels are changed through “Record Movement” so the history stays complete.'
              : 'Opening stock is recorded as the first stock-in movement.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <Label className="text-xs font-medium text-[#344054]">Item Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value as InventoryCategory)} className={SELECT_CLASS}>
                {CATEGORIES.map(c => <option key={c} value={c}>{INVENTORY_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Unit <span className="text-[#98A2B3] font-normal">(optional)</span></Label>
              <Input value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!item && (
              <div>
                <Label className="text-xs font-medium text-[#344054]">Opening Stock</Label>
                <Input type="number" min={0} step={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 text-xs" required />
              </div>
            )}
            <div>
              <Label className="text-xs font-medium text-[#344054]">Minimum Stock</Label>
              <Input type="number" min={0} step={1} value={minStock} onChange={e => setMinStock(e.target.value)} className="mt-1 text-xs" required />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Storage Location <span className="text-[#98A2B3] font-normal">(optional)</span></Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} className="mt-1 text-xs" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : item ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Record Movement Dialog ───────────────────────────────────────────────────
const MovementDialog: React.FC<{
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
}> = ({ open, item, onClose }) => {
  const { moveInventoryItem } = useData();
  const [type, setType] = useState<MovementType>('stock_in');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const close = () => { setType('stock_in'); setQuantity(''); setNote(''); setError(''); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!item) return;
    const value = Number(quantity);
    if (!Number.isInteger(value) || value < 0) { setError('Enter a whole-number quantity.'); return; }

    setSubmitting(true);
    try {
      await moveInventoryItem(item.id, { type, quantity: value, note: note.trim() || undefined });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record this movement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) close(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList size={16} className="text-[#006B5D]" /> Record Stock Movement
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item
              ? `${item.name} — currently ${item.quantity}${item.unit ? ` ${item.unit}(s)` : ''} in stock`
              : 'Select an item first.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <Label className="text-xs font-medium text-[#344054]">Movement Type</Label>
            <select value={type} onChange={e => setType(e.target.value as MovementType)} className={SELECT_CLASS}>
              <option value="stock_in">Stock In — purchase or donation received</option>
              <option value="stock_out">Stock Out — issued to a class or consumed</option>
              <option value="adjust">Adjust — set to a physical count</option>
            </select>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">
              {type === 'adjust' ? 'New Absolute Quantity' : 'Quantity'}
            </Label>
            <Input type="number" min={0} step={1} value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Note <span className="text-[#98A2B3] font-normal">(optional)</span></Label>
            <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 text-xs" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Record Movement'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const InventoryPage: React.FC = () => {
  const { inventoryItems, inventoryMovements, lowStockCount } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | InventoryCategory>('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [moving, setMoving] = useState<InventoryItem | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventoryItems.filter(i =>
      (categoryFilter === 'all' || i.category === categoryFilter) &&
      (!lowOnly || i.lowStock) &&
      (!q || i.name.toLowerCase().includes(q) || (i.location ?? '').toLowerCase().includes(q)),
    );
  }, [inventoryItems, search, categoryFilter, lowOnly]);

  const totalUnits = inventoryItems.reduce((s, i) => s + i.quantity, 0);
  const categoryCounts = useMemo(() => {
    const map = new Map<InventoryCategory, number>();
    inventoryItems.forEach(i => map.set(i.category, (map.get(i.category) ?? 0) + 1));
    return CATEGORIES.filter(c => map.has(c)).map(c => ({ category: c, count: map.get(c) ?? 0 }));
  }, [inventoryItems]);
  const maxCategoryCount = Math.max(1, ...categoryCounts.map(c => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Inventory & Supplies</h1>
          <p className="text-sm text-[#667085]">
            Track school stock, issue supplies to classes, and reorder before running out
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => { setEditing(null); setItemDialogOpen(true); }}>
          <Plus size={15} /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tracked Items"
          value={String(inventoryItems.length)}
          subtitle={`${categoryCounts.length} categories in use`}
          icon={<Boxes className="text-[#006B5D]" size={20} />}
        />
        <StatCard
          title="Total Units in Stock"
          value={totalUnits.toLocaleString('en-PK')}
          subtitle="Across every tracked item"
          icon={<Package className="text-[#006B5D]" size={20} />}
        />
        <StatCard
          title="Low Stock Alerts"
          value={String(lowStockCount)}
          subtitle={lowStockCount ? 'At or below minimum level' : 'Everything is above minimum'}
          icon={<AlertTriangle className={lowStockCount ? 'text-red-600' : 'text-[#006B5D]'} size={20} />}
          iconBg={lowStockCount ? 'bg-red-50' : undefined}
        />
        <StatCard
          title="Movements Logged"
          value={String(inventoryMovements.length)}
          subtitle="Most recent 100 entries"
          icon={<ClipboardList className="text-[#006B5D]" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Stock Items</CardTitle>
              <p className="text-xs text-[#98A2B3]">Items at or below their minimum are flagged for reorder</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search item or location…"
                  className="pl-8 text-xs w-[190px]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as 'all' | InventoryCategory)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{INVENTORY_CATEGORY_LABELS[c]}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-[11px] text-[#667085] cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowOnly}
                  onChange={e => setLowOnly(e.target.checked)}
                  className="rounded accent-[#006B5D]"
                />
                Low only
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-xs text-[#98A2B3] py-12 text-center">
                {inventoryItems.length === 0
                  ? 'No inventory yet. Use “Add Item” to record your first stock entry.'
                  : 'No items match this filter.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                    <tr>
                      <th className="p-3.5 pl-5">Item</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5 text-right">In Stock</th>
                      <th className="p-3.5 text-right">Minimum</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 pr-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-5">
                          <p className="font-semibold text-[#101828]">{i.name}</p>
                          <p className="text-[10px] text-[#98A2B3]">Updated {formatWhen(i.updatedAt)}</p>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {INVENTORY_CATEGORY_LABELS[i.category]}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-[#344054]">{i.location ?? '—'}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-[#101828]">
                          {i.quantity}{i.unit ? <span className="text-[10px] font-normal text-[#98A2B3]"> {i.unit}</span> : null}
                        </td>
                        <td className="p-3.5 text-right font-mono text-[#667085]">{i.minStock}</td>
                        <td className="p-3.5 text-center">
                          {i.lowStock ? (
                            <Badge className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">Low</Badge>
                          ) : (
                            <Badge className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">OK</Badge>
                          )}
                        </td>
                        <td className="p-3.5 pr-5">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost" size="sm" className="gap-1 text-[11px]"
                              onClick={() => { setMoving(i); setMoveDialogOpen(true); }}
                            >
                              <ArrowUpFromLine size={13} /> Move
                            </Button>
                            <Button
                              variant="ghost" size="sm" className="gap-1 text-[11px]"
                              onClick={() => { setEditing(i); setItemDialogOpen(true); }}
                            >
                              <Pencil size={13} /> Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Items by Category</CardTitle>
              <p className="text-xs text-[#98A2B3]">Where your stock is concentrated</p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {categoryCounts.length === 0 ? (
                <p className="text-xs text-[#98A2B3] py-4 text-center">No items yet.</p>
              ) : (
                categoryCounts.map(c => (
                  <div key={c.category}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-[#344054]">{INVENTORY_CATEGORY_LABELS[c.category]}</span>
                      <span className="text-[#667085] font-mono">{c.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#006B5D]"
                        style={{ width: `${Math.round((c.count / maxCategoryCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Recent Movements</CardTitle>
              <p className="text-xs text-[#98A2B3]">Full audit trail of every stock change</p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {inventoryMovements.length === 0 ? (
                <p className="text-xs text-[#98A2B3] py-4 text-center">No movements recorded yet.</p>
              ) : (
                inventoryMovements.slice(0, 8).map(m => (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <span className={cn('mt-0.5 shrink-0 rounded-md border p-1', MOVEMENT_STYLE[m.type])}>
                      {m.type === 'stock_in'
                        ? <ArrowDownToLine size={12} />
                        : m.type === 'stock_out' ? <ArrowUpFromLine size={12} /> : <ClipboardList size={12} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-[#101828] truncate">
                        {m.itemName ?? 'Item'} — {MOVEMENT_TYPE_LABELS[m.type]} {m.quantity}
                      </p>
                      <p className="text-[10px] text-[#98A2B3]">
                        {formatWhen(m.createdAt)} · {m.byName}
                        {m.note ? ` · ${m.note}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ItemDialog open={itemDialogOpen} item={editing} onClose={() => setItemDialogOpen(false)} />
      <MovementDialog open={moveDialogOpen} item={moving} onClose={() => setMoveDialogOpen(false)} />
    </div>
  );
};
