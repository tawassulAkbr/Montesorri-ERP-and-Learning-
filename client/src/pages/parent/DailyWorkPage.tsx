import { useState } from 'react';
import { BookOpen, Paperclip, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';

export const ParentDailyWorkPage: React.FC = () => {
  const { dailyWork, students } = useData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Child's Daily Montessori Work & Activities</h1>
          <p className="text-sm text-[#667085]">Review homework activities, phonics tracing worksheets, and classroom summaries</p>
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

      <div className="space-y-4">
        {dailyWork.map(work => (
          <Card key={work.id} className="overflow-hidden border border-slate-100 shadow-sm">
            <CardHeader className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006B5D] text-white flex items-center justify-center font-bold text-xs">
                  {work.teacherSubject.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#101828]">{work.teacherSubject}</h3>
                    <Badge variant="outline" className="text-[10px] bg-white border-slate-200">
                      {work.class}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#667085]">Assigned by {work.teacherName}</p>
                </div>
              </div>

              <span className="text-[11px] text-[#667085] font-medium">
                {formatDateTime(work.postedAt)}
              </span>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              <div
                className="text-xs text-[#344054] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: work.content }}
              />

              {work.attachmentName && (
                <div className="flex items-center gap-2 pt-2 text-xs text-[#006B5D] bg-[#E6F4F1]/60 p-2.5 rounded-lg border border-[#B7DDD6] w-fit">
                  <Paperclip size={14} />
                  <span className="font-semibold">{work.attachmentName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
