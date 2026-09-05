import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Paperclip, CheckCircle2, Calendar, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/lib/utils';
import type { DailyWork } from '@/types';

export const DailyWorkPage: React.FC = () => {
  const { dailyWork, addDailyWork } = useData();
  const { currentUser } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [subject, setSubject] = useState('Practical Life');
  const [targetClass, setTargetClass] = useState('Primary Montessori / Playgroup & Nursery (Ages 3 - 6)');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState('');

  const handlePostWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || content === '<p><br></p>') return;

    addDailyWork({
      teacherId: currentUser?.id ?? '',
      teacherName: currentUser?.name ?? '',
      teacherSubject: subject,
      class: targetClass,
      content,
      attachmentName: attachment || undefined,
      visibleTo: ['students', 'parents'],
    });

    setOpenModal(false);
    setContent('');
    setAttachment('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Montessori Daily Work & Activity Logs</h1>
          <p className="text-sm text-[#667085]">Post everyday sensorial milestones, circle summaries, and home guidance for parents</p>
        </div>

        <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Broadcast Daily Work
        </Button>
      </div>

      {/* Daily Work Feed */}
      <div className="space-y-4">
        {dailyWork.map(work => (
          <Card key={work.id} className="overflow-hidden border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
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
                  <p className="text-[11px] text-[#667085]">Posted by {work.teacherName}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-[#667085] font-medium block">
                  {formatDateTime(work.postedAt)}
                </span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  Visible to Students & Parents
                </span>
              </div>
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

      {/* Post Daily Work Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="text-[#006B5D]" size={20} />
              Broadcast Daily Montessori Activity Log
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePostWork} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Learning Area</Label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Practical Life</option>
                  <option>Sensorial</option>
                  <option>Language Arts</option>
                  <option>Mathematics</option>
                  <option>Cultural Studies / General Knowledge</option>
                  <option>Islamiyat</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium text-[#344054]">Class Cohort</Label>
                <select
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Early Childhood / Toddler (Ages 1.5 - 3)</option>
                  <option>Primary Montessori / Playgroup & Nursery (Ages 3 - 6)</option>
                  <option>Lower Elementary / Prep & Class 1 (Ages 6 - 9)</option>
                  <option>Upper Elementary / Class 2 - 5 (Ages 9 - 12)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054] mb-1 block">
                Activity Details & Home Guidance (Rich Text)
              </Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Detail today's sensorial materials used, phonetic sounds, and tips for parents..."
                minHeight={150}
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Attachment File Name (Mock)</Label>
              <Input
                value={attachment}
                onChange={e => setAttachment(e.target.value)}
                placeholder="e.g. phonics_letter_tracing_sheet.pdf"
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Broadcast to Portal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


