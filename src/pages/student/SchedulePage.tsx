import { Calendar, Sun, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScheduleTimeline } from '@/components/shared/ScheduleTimeline';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';

export const StudentSchedulePage: React.FC = () => {
  const { schedules } = useData();
  const myClassSchedules = schedules.filter(s => s.class === 'Junior Montessori (Nursery)');

  return (
    <div className="space-y-6">
      <LiveClassBanner />

      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Daily Montessori Routine 🌟</h1>
        <p className="text-sm text-slate-500">Here is your fun schedule for today at Junior Montessori</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="text-amber-500" size={18} />
            Today's Activities & Fun Circle Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleTimeline items={myClassSchedules} />
        </CardContent>
      </Card>
    </div>
  );
};
