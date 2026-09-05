import { MessageSquareHeart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/lib/utils';

export const AdminFeedbackPage: React.FC = () => {
  const { feedbacks } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Student Feedback Overview</h1>
        <p className="text-sm text-[#667085]">
          All student feedback with identities (visible to admin only). Teachers see these anonymously.
        </p>
      </div>

      <div className="space-y-3">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm font-semibold text-[#344054]">No feedback submitted yet</p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map(fb => (
            <Card key={fb.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#006B5D] flex items-center justify-center flex-shrink-0">
                  <MessageSquareHeart size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#344054]">
                      {fb.studentName} → {fb.teacherName}
                    </span>
                    <span className="text-[10px] text-[#667085]">
                      {formatDate(fb.createdAt)} · {fb.readByTeacher ? 'read by teacher' : 'unread by teacher'}
                    </span>
                  </div>
                  <p className="text-sm text-[#344054]">{fb.content}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
