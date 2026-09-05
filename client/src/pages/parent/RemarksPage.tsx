import { useState } from 'react';
import { MessageSquare, Heart, Sparkles, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { RemarkType } from '@/types';

export const ParentRemarksPage: React.FC = () => {
  const { students, remarks } = useData();
  const { currentUser } = useAuth();
  const myChildren = students.filter(s => s.parentId === currentUser?.id);
  const [selectedChildId, setSelectedChildId] = useState<string>(myChildren[0]?.id || '');

  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];

  if (!selectedChild) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-100">
        <p className="text-sm font-semibold text-[#344054]">No children are linked to this account yet.</p>
        <p className="text-xs text-[#667085] mt-1">Please contact the school administrator.</p>
      </div>
    );
  }

  const childRemarks = remarks.filter(r => r.studentId === selectedChild.id);

  const typeConfig: Record<RemarkType, { label: string; border: string; bg: string; text: string }> = {
    positive: { label: 'Praise & Milestone Progress', border: 'border-l-4 border-l-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    constructive: { label: 'Developmental Guidance', border: 'border-l-4 border-l-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    concern: { label: 'Parent Collaboration Needed', border: 'border-l-4 border-l-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Montessori Teacher Observations & Remarks</h1>
          <p className="text-sm text-[#667085]">Official notes, behavioural feedback, and developmental progress from teachers</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#667085] font-medium">Viewing for:</span>
          <select
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-[#344054] outline-none shadow-sm cursor-pointer"
          >
            {myChildren.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Remarks Feed */}
      <div className="space-y-4">
        {childRemarks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
            <MessageSquare className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-sm font-semibold text-[#344054]">No observation remarks posted yet</p>
            <p className="text-xs text-[#667085]">Teacher remarks will appear here immediately when submitted in the teacher portal.</p>
          </div>
        ) : (
          childRemarks.map(rem => {
            const cfg = typeConfig[rem.type];
            return (
              <Card key={rem.id} className={`overflow-hidden shadow-sm ${cfg.border}`}>
                <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#006B5D] text-white flex items-center justify-center font-bold text-xs">
                      {rem.teacherSubject.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#101828]">{rem.teacherName}</h3>
                      <p className="text-[11px] text-[#667085]">Learning Area: {rem.teacherSubject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-[#667085] font-medium">
                      {formatDate(rem.createdAt)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div
                    className="text-xs text-[#344054] leading-relaxed ql-editor border-0 p-0"
                    dangerouslySetInnerHTML={{ __html: rem.content }}
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
