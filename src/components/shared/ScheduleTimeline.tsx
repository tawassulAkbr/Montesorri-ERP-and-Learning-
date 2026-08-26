import React from 'react';
import { Clock, Video, BookOpen, Sun, Coffee, Palette, Compass, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { ScheduleItem, ScheduleCategory } from '@/types';

interface ScheduleTimelineProps {
  items: ScheduleItem[];
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

const CATEGORY_CONFIG: Record<ScheduleCategory, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  circle_time: { label: 'Morning Circle', icon: <Sun size={15} />, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  live_class: { label: 'Live Online Class', icon: <Video size={15} />, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  sensorial: { label: 'Montessori Work Period', icon: <Compass size={15} />, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  phonics: { label: 'Phonics & Reading', icon: <BookOpen size={15} />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  math: { label: 'Early Math Discovery', icon: <BookOpen size={15} />, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  snack_break: { label: 'Snack & Table Grace', icon: <Coffee size={15} />, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  art_craft: { label: 'Creative Art & Crafts', icon: <Palette size={15} />, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  outdoor_play: { label: 'Motor Skills & Play', icon: <Sun size={15} />, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  storytelling: { label: 'Storybook Circle', icon: <BookOpen size={15} />, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ items, canDelete = false, onDelete }) => {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.circle_time;
        const isCurrent = idx === 1; // Highlight ongoing class

        return (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isCurrent
                ? 'bg-gradient-to-r from-indigo-50/90 to-white border-indigo-300 shadow-sm ring-2 ring-indigo-200'
                : 'bg-white border-slate-100 shadow-xs hover:border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.icon}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      ● Active Now
                    </span>
                  )}
                  {item.isLive && (
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                      🔴 Live Session
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">Lead: {item.teacherName} • {item.class}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Clock size={13} className="text-indigo-600" />
                <span>{item.startTime} – {item.endTime}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.isLive && (
                  <Link to="/student/live-class">
                    <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white gap-1">
                      <Video size={12} /> Enter Class
                    </Button>
                  </Link>
                )}
                {canDelete && onDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-7 w-7 text-slate-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
