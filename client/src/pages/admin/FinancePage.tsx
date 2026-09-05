import { useMemo, useState } from 'react';
import {
  Banknote, Receipt as ReceiptIcon, Wallet, AlertCircle, Plus, Search, GraduationCap,
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { IncomeBarChart, FeeCollectionPieChart } from '@/components/shared/Charts';
import { ReceiptDialog } from '@/components/shared/ReceiptDocument';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { cn, formatDate, formatPKR, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import type { Payment, PaymentMethod, Student } from '@/types';

const SELECT_CLASS =
  'w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white';

function currentTerm(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// ─── Record Payment Dialog ────────────────────────────────────────────────────
const RecordPaymentDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  students: Student[];
  onRecorded: (payment: Payment) => void;
}> = ({ open, onClose, students, onRecorded }) => {
  const { recordPayment } = useData();
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [term, setTerm] = useState(currentTerm);
  const [note, setNote] = useState('');
  const [dueOnly, setDueOnly] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const options = useMemo(() => {
    const list = dueOnly ? students.filter(s => s.feeDue) : students;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, dueOnly]);

  const pickStudent = (id: string) => {
    setStudentId(id);
    const student = students.find(s => s.id === id);
    if (student?.feeAmount) setAmount(String(student.feeAmount));
  };

  const reset = () => {
    setStudentId('');
    setAmount('');
    setMethod('cash');
    setTerm(currentTerm());
    setNote('');
    setError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!studentId) { setError('Select a student.'); return; }
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) { setError('Enter an amount in whole rupees.'); return; }
    if (term.trim().length < 2) { setError('Enter the fee term this payment covers.'); return; }

    setSubmitting(true);
    try {
      const payment = await recordPayment({
        studentId, amount: value, method, term: term.trim(), note: note.trim() || undefined,
      });
      reset();
      onRecorded(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record this payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote size={16} className="text-[#006B5D]" /> Record Fee Payment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Saves a receipt in the ledger and marks the student's fee as cleared.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-[#344054]">Student</Label>
              <label className="flex items-center gap-1.5 text-[11px] text-[#667085] cursor-pointer">
                <input
                  type="checkbox"
                  checked={dueOnly}
                  onChange={e => { setDueOnly(e.target.checked); setStudentId(''); }}
                  className="rounded accent-[#006B5D]"
                />
                Fee due only
              </label>
            </div>
            <select value={studentId} onChange={e => pickStudent(e.target.value)} className={cn(SELECT_CLASS, 'mt-1')} required>
              <option value="">Select a student…</option>
              {options.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.class}{s.feeAmount ? ` (Rs ${s.feeAmount.toLocaleString('en-PK')})` : ''}
                </option>
              ))}
            </select>
            {dueOnly && options.length === 0 && (
              <p className="mt-1.5 text-[11px] text-emerald-700">No outstanding fees — every student is paid up.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Amount (Rs)</Label>
              <Input
                type="number" min={1} step={1} value={amount}
                onChange={e => setAmount(e.target.value)}
                className="mt-1 text-xs" required
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#344054]">Method</Label>
              <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className={SELECT_CLASS}>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Fee Term</Label>
            <Input value={term} onChange={e => setTerm(e.target.value)} className="mt-1 text-xs" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-[#344054]">Note <span className="text-[#98A2B3] font-normal">(optional)</span></Label>
            <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1 text-xs" />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => { reset(); onClose(); }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Payment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const FinancePage: React.FC = () => {
  const { students, payments, financeSummary } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');

  const summary = financeSummary;
  const collectedStudents = students.length - (summary?.outstandingCount ?? students.filter(s => s.feeDue).length);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(p =>
      (methodFilter === 'all' || p.method === methodFilter) &&
      (!q ||
        p.receiptNo.toLowerCase().includes(q) ||
        (p.studentName ?? '').toLowerCase().includes(q) ||
        p.term.toLowerCase().includes(q)),
    );
  }, [payments, search, methodFilter]);

  const methodTotals = summary?.byMethod ?? [];
  const methodSum = methodTotals.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Finance & Fee Collection</h1>
          <p className="text-sm text-[#667085]">
            Record fee payments, issue receipts, and track monthly income
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setDialogOpen(true)}>
          <Plus size={15} /> Record Payment
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Collected This Month"
          value={formatPKR(summary?.collectedThisMonth ?? 0)}
          subtitle={
            summary ? `${summary.months[summary.months.length - 1]?.count ?? 0} payments recorded` : 'No data yet'
          }
          icon={<Wallet className="text-[#006B5D]" size={20} />}
        />
        <StatCard
          title="Outstanding"
          value={formatPKR(summary?.outstandingAmount ?? 0)}
          subtitle={`${summary?.outstandingCount ?? 0} student(s) with fee due`}
          icon={<AlertCircle className="text-red-600" size={20} />}
          iconBg="bg-red-50"
        />
        <StatCard
          title="Lifetime Collection"
          value={formatPKR(summary?.collectedTotal ?? 0)}
          subtitle={`${payments.length} receipts issued`}
          icon={<Banknote className="text-[#006B5D]" size={20} />}
        />
        <StatCard
          title="Average Fee"
          value={formatPKR(summary?.avgFee ?? 0)}
          subtitle={`${summary?.totalStudents ?? students.length} enrolled students`}
          icon={<GraduationCap className="text-[#006B5D]" size={20} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Income (Last 6 Months)</CardTitle>
            <p className="text-xs text-[#98A2B3]">Fee payments received per month</p>
          </CardHeader>
          <CardContent>
            {summary && summary.collectedTotal > 0 ? (
              <IncomeBarChart data={summary.months} height={240} />
            ) : (
              <p className="text-xs text-[#98A2B3] py-12 text-center">No income recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Fee Collection Status</CardTitle>
              <p className="text-xs text-[#98A2B3]">Students paid vs outstanding</p>
            </CardHeader>
            <CardContent>
              <FeeCollectionPieChart collected={Math.max(collectedStudents, 0)} outstanding={summary?.outstandingCount ?? 0} height={150} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">By Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {methodTotals.length === 0 ? (
                <p className="text-xs text-[#98A2B3] py-4 text-center">No payments yet.</p>
              ) : (
                methodTotals.map(m => (
                  <div key={m.method}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-[#344054]">{PAYMENT_METHOD_LABELS[m.method]}</span>
                      <span className="text-[#667085] font-mono">{formatPKR(m.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#006B5D]"
                        style={{ width: `${methodSum ? Math.round((m.amount / methodSum) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ledger */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Payments Ledger</CardTitle>
            <p className="text-xs text-[#98A2B3]">Newest receipts first — open any row to reprint it</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search receipt, student, term…"
                className="pl-8 text-xs w-[210px]"
              />
            </div>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as 'all' | PaymentMethod)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-2 focus:ring-[#006B5D] bg-white"
            >
              <option value="all">All methods</option>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(m => (
                <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#98A2B3] py-12 text-center">
              {payments.length === 0
                ? 'No payments recorded yet. Use “Record Payment” to issue the first receipt.'
                : 'No receipts match this filter.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-5">Receipt</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Term</th>
                    <th className="p-3.5 text-center">Method</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Received By</th>
                    <th className="p-3.5 pr-5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <p className="font-mono font-bold text-[#101828]">{p.receiptNo}</p>
                        <p className="text-[10px] text-[#98A2B3]">{formatDate(p.createdAt)}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-[#101828]">{p.studentName ?? '—'}</p>
                        <p className="text-[10px] text-[#667085]">
                          {p.studentClass ?? ''}{p.studentRollNo ? ` · Roll ${p.studentRollNo}` : ''}
                        </p>
                      </td>
                      <td className="p-3.5 text-[#344054]">{p.term}</td>
                      <td className="p-3.5 text-center">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {PAYMENT_METHOD_LABELS[p.method]}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#006B5D]">{formatPKR(p.amount)}</td>
                      <td className="p-3.5 text-[#344054]">{p.receivedByName ?? 'School Office'}</td>
                      <td className="p-3.5 pr-5 text-center">
                        <Button variant="ghost" size="sm" className="gap-1 text-[11px]" onClick={() => setReceipt(p)}>
                          <ReceiptIcon size={13} /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        students={students}
        onRecorded={payment => { setDialogOpen(false); setReceipt(payment); }}
      />
      <ReceiptDialog payment={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
};
