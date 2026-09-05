import { Calendar, Sun, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScheduleTimeline } from '@/components/shared/ScheduleTimeline';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';

export const StudentSchedulePage: React.FC = () => {
  const { schedules } = useData();
  const myClassSchedules = schedules.filter(s => s.class === 'Primary Montessori / Playgroup & Nursery (Ages 3 - 6)');

  return (
    <div className="space-y-6">
      <LiveClassBanner />

      <div>
        <h1 className="text-2xl font-bold text-[#101828]">My Daily Montessori Routine 🌟</h1>
        <p className="text-sm text-[#667085]">Here is your fun schedule for today at Primary Montessori / Playgroup & Nursery (Ages 3 - 6)</p>
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


