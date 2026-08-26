import { useState } from 'react';
import { Calendar, Sun, Coffee, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScheduleTimeline } from '@/components/shared/ScheduleTimeline';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';

export const ParentSchedulePage: React.FC = () => {
  const { schedules, students } = useData();
  const myChildren = students.filter(s => s.parentId === 'p1');
  const [selectedChildId, setSelectedChildId] = useState(myChildren[0]?.id || 's1');

  const selectedChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];
  const childSchedules = schedules.filter(s => s.class === (selectedChild?.class || 'Junior Montessori (Nursery)'));

  return (
    <div className="space-y-6">
      <LiveClassBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Child's Daily Schedule & Routine</h1>
          <p className="text-sm text-slate-500">Montessori curriculum timeline, snack times, and live online learning slots</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Viewing for:</span>
          <select
            value={selectedChildId}
            onChange={e => setSelectedChildId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            {myChildren.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Daily Routine — {selectedChild.name} ({selectedChild.class})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleTimeline items={childSchedules} />
            </CardContent>
          </Card>
        </div>

        {/* Dietary & Routine Guidelines */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50/70 to-white border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <Coffee size={16} /> Snack & Meal Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>• Today's Fruit: Cut apples, bananas, or seasonal berries.</p>
              <p>• Clean finger snacks in easy-to-open silicone containers.</p>
              <p>• Child practices self-pouring water and folding their personal napkin.</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50/70 to-white border-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                <Sparkles size={16} /> Montessori Work Preparation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-2">
              <p>• Comfortable slip-on indoor shoes for work mats.</p>
              <p>• Extra set of labeled clothes in backpack for sensory water play.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
