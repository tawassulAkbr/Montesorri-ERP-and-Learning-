import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { LeaveRequest } from '@/types';

// ─── Submit Leave Modal (students via parents, and teachers) ─────────────────
interface SubmitLeaveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  applicantLabel?: string;
  onSubmit: (data: { fromDate: string; toDate: string; reason: string }) => void;
}

export const SubmitLeaveModal: React.FC<SubmitLeaveModalProps> = ({
  open, onOpenChange, applicantName, applicantLabel = 'Student', onSubmit,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;
    onSubmit({ fromDate, toDate, reason });
    setFromDate(''); setToDate(''); setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={18} />
            Apply for Leave
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
            {applicantLabel}: <strong>{applicantName}</strong>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                min={fromDate}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Please provide the reason for leave..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Teacher: Leave Request Card ──────────────────────────────────────────────
const statusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface LeaveRequestCardProps {
  leave: LeaveRequest;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const LeaveRequestCard: React.FC<LeaveRequestCardProps> = ({
  leave, showActions = false, onAccept, onReject,
}) => {
  const cfg = statusConfig[leave.status];
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <FileText className="text-indigo-600" size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-semibold text-sm text-slate-800">
            {leave.kind === 'teacher' ? leave.teacherName : leave.studentName}
            {leave.kind === 'teacher' && (
              <span className="ml-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">Teacher</span>
            )}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-1">
          {formatDate(leave.fromDate)} {leave.fromDate !== leave.toDate && `– ${formatDate(leave.toDate)}`}
        </p>
        <p className="text-xs text-slate-600 line-clamp-2">{leave.reason}</p>
        {leave.kind !== 'teacher' && (
          <p className="text-xs text-slate-400 mt-1">by {leave.parentName}</p>
        )}
        {showActions && leave.status === 'pending' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onAccept?.(leave.id)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Check size={12} /> Accept
            </button>
            <button
              onClick={() => onReject?.(leave.id)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X size={12} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
