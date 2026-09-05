import { Link } from 'react-router-dom';
import { Radio, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';

export const LiveClassBanner: React.FC = () => {
  const { liveClass } = useData();
  const { role } = useAuth();

  if (!liveClass.isActive) return null;

  const joinLink = role === 'teacher' ? '/teacher/live-class' : '/student/live-class';

  return (
    <div className="bg-gradient-to-r from-red-500 via-rose-600 to-indigo-600 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white flex-shrink-0">
          <Radio size={20} className="animate-spin text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded-full">
              🔴 LIVE NOW
            </span>
            <span className="text-xs text-white/90 font-medium">{liveClass.class}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">{liveClass.topic}</h4>
          <p className="text-[11px] text-white/80">Host: {liveClass.teacherName} • {liveClass.subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link to={joinLink}>
          <Button variant="secondary" size="sm" className="font-bold text-xs gap-1.5 shadow-sm text-red-600 hover:text-red-700 bg-white">
            <Video size={15} /> Join Live Classroom <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
