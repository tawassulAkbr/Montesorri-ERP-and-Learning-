import { useState } from 'react';
import { Play, Eye, BookOpen, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Lesson } from '@/types';

interface VideoCardProps {
  lesson: Lesson;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Practical Life': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sensorial': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Language Arts': 'bg-[#E6F4F1] text-[#006B5D] border-[#B7DDD6]',
  'Mathematics': 'bg-blue-50 text-blue-700 border-blue-200',
  'Cultural Studies / General Knowledge': 'bg-amber-50 text-amber-700 border-amber-200',
  'Islamiyat': 'bg-teal-50 text-teal-700 border-teal-200',
};

export const VideoCard: React.FC<VideoCardProps> = ({ lesson }) => {
  const [open, setOpen] = useState(false);
  const isUpload = !lesson.youtubeId && !!lesson.videoUrl;
  const thumbUrl = lesson.youtubeId
    ? `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`
    : null;
  const subjectColor = SUBJECT_COLORS[lesson.subject] || 'bg-slate-50 text-[#344054] border-slate-200';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm card-hover cursor-pointer group"
        onClick={() => setOpen(true)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-[#E6F4F1] to-[#007A6B] overflow-hidden">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={lesson.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#006B5D] gap-2">
              <Video size={28} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Teacher Recording</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="text-[#006B5D] w-5 h-5 ml-0.5" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
            {lesson.duration}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${subjectColor}`}>
              {lesson.subject}
            </span>
            {isUpload && (
              <span className="text-[10px] font-semibold text-[#006B5D] bg-[#E6F4F1] border border-[#B7DDD6] px-2 py-0.5 rounded-full">
                Uploaded
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#101828] text-sm leading-snug mb-2 line-clamp-2">
            {lesson.title}
          </h3>
          <p className="text-xs text-[#667085] line-clamp-2 mb-3">{lesson.description}</p>
          <div className="flex items-center justify-between text-xs text-[#667085]">
            <div className="flex items-center gap-1">
              <BookOpen size={12} />
              <span>{lesson.teacherName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{lesson.views} views</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-base">{lesson.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black">
            {lesson.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
                title={lesson.title}
              />
            ) : (
              <video src={lesson.videoUrl} controls autoPlay className="w-full h-full" title={lesson.title} />
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{lesson.subject}</Badge>
              <span className="text-xs text-[#667085]">{lesson.class}</span>
            </div>
            <p className="text-sm text-[#667085]">{lesson.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
