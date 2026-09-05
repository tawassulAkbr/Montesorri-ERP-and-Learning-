import { Receipt as ReceiptIcon, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { formatDate, formatPKR, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import type { Payment } from '@/types';

const ReceiptRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-slate-200 py-1.5">
    <dt className="text-[10px] uppercase tracking-wide text-[#667085]">{label}</dt>
    <dd className="text-[11px] font-semibold text-[#101828] text-right">{value || '—'}</dd>
  </div>
);

// The printable fragment: @media print isolates .print-area from the app shell.
export const ReceiptDocument: React.FC<{ payment: Payment }> = ({ payment }) => (
  <div className="print-area rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-4 border-b-2 border-[#006B5D] pb-3">
      <div>
        <p className="text-sm font-extrabold text-[#101828]">{payment.schoolName ?? 'KinderGuide Montessori'}</p>
        {payment.schoolAddress && <p className="text-[10px] text-[#667085] mt-0.5">{payment.schoolAddress}</p>}
        {payment.schoolPhone && <p className="text-[10px] text-[#667085]">{payment.schoolPhone}</p>}
      </div>
      <div className="text-right">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#006B5D]">Fee Receipt</p>
        <p className="text-xs font-mono font-bold text-[#101828]">{payment.receiptNo}</p>
        <p className="text-[10px] text-[#667085]">{formatDate(payment.createdAt)}</p>
      </div>
    </div>

    <dl className="mt-3">
      <ReceiptRow label="Received from" value={payment.guardianName ?? payment.studentName} />
      <ReceiptRow label="Student" value={payment.studentName} />
      <ReceiptRow label="Class" value={payment.studentClass} />
      <ReceiptRow label="Roll No" value={payment.studentRollNo} />
      <ReceiptRow label="Enrollment ID" value={payment.studentEnrollmentId} />
      <ReceiptRow label="Fee term" value={payment.term} />
      <ReceiptRow label="Payment method" value={PAYMENT_METHOD_LABELS[payment.method]} />
      <ReceiptRow label="Received by" value={payment.receivedByName ?? 'School Office'} />
    </dl>

    <div className="mt-3 flex items-center justify-between rounded-lg border border-[#BFE3DC] bg-[#E6F4F1] px-3 py-2">
      <span className="text-[11px] font-bold text-[#006B5D]">Amount Paid</span>
      <span className="text-base font-extrabold text-[#006B5D]">{formatPKR(payment.amount)}</span>
    </div>

    {payment.note && (
      <p className="mt-2 text-[10px] italic text-[#667085]">Note: {payment.note}</p>
    )}

    <div className="mt-8 flex items-end justify-between gap-4">
      <p className="text-[9px] text-[#98A2B3] max-w-[55%]">
        Computer-generated receipt — valid without signature.
      </p>
      <div className="text-center">
        <div className="mb-1 h-px w-28 bg-slate-400" />
        <span className="text-[9px] text-[#667085]">Authorised Signature</span>
      </div>
    </div>
  </div>
);

export const ReceiptDialog: React.FC<{ payment: Payment | null; onClose: () => void }> = ({ payment, onClose }) => (
  <Dialog open={!!payment} onOpenChange={o => { if (!o) onClose(); }}>
    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader className="no-print">
        <DialogTitle className="flex items-center gap-2">
          <ReceiptIcon size={16} className="text-[#006B5D]" /> Payment Receipt
        </DialogTitle>
        <DialogDescription className="text-xs">
          Print or save as PDF — only the receipt is included in the printout.
        </DialogDescription>
      </DialogHeader>

      {payment && <ReceiptDocument payment={payment} />}

      <DialogFooter className="no-print">
        <Button variant="outline" type="button" onClick={onClose}>Close</Button>
        <Button type="button" className="gap-1.5" onClick={() => window.print()}>
          <Printer size={14} /> Print / Save PDF
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
