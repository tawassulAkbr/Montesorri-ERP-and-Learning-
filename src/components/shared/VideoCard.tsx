import { useState } from 'react';
import { Play, Eye, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { Lesson } from '@/types';

interface VideoCardProps {
  lesson: Lesson;
}

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Science': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'English': 'bg-sky-50 text-sky-700 border-sky-200',
  'Arabic': 'bg-amber-50 text-amber-700 border-amber-200',
  'Art & Craft': 'bg-pink-50 text-pink-700 border-pink-200',
};

export const VideoCard: React.FC<VideoCardProps> = ({ lesson }) => {
  const [open, setOpen] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`;
  const subjectColor = SUBJECT_COLORS[lesson.subject] || 'bg-slate-50 text-slate-700 border-slate-200';

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
        <div className="relative aspect-video bg-slate-100 overflow-hidden">
          <img
            src={thumbUrl}
            alt={lesson.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="text-indigo-600 w-5 h-5 ml-0.5" fill="currentColor" />
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
          </div>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">
            {lesson.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{lesson.description}</p>
          <div className="flex items-center justify-between text-xs text-slate-400">
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
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1`}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay"
              title={lesson.title}
            />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{lesson.subject}</Badge>
              <span className="text-xs text-slate-400">{lesson.class}</span>
            </div>
            <p className="text-sm text-slate-500">{lesson.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
