import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Calendar, Sparkles, Video, Sun, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScheduleTimeline } from '@/components/shared/ScheduleTimeline';
import { useData } from '@/context/DataContext';
import type { ScheduleCategory } from '@/types';

export const TeacherSchedulePage: React.FC = () => {
  const { schedules, addScheduleItem, deleteScheduleItem } = useData();
  const [selectedClass, setSelectedClass] = useState('Primary Montessori / Playgroup & Nursery (Ages 3 - 6)');
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('sensorial');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('09:45 AM');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(false);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addScheduleItem({
      title,
      category,
      startTime,
      endTime,
      class: selectedClass,
      teacherName: 'Amina Khan',
      description,
      isLive,
    });

    setOpenModal(false);
    setTitle('');
    setDescription('');
    setIsLive(false);
  };

  const filteredSchedules = schedules.filter(s => s.class === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Montessori Daily Schedule & Timetable</h1>
          <p className="text-sm text-[#667085]">Plan daily routine slots, circle times, sensorial work cycles, and live classes</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-[#344054] outline-none shadow-sm cursor-pointer"
          >
            <option>Early Childhood / Toddler (Ages 1.5 - 3)</option>
            <option>Primary Montessori / Playgroup & Nursery (Ages 3 - 6)</option>
            <option>Lower Elementary / Prep & Class 1 (Ages 6 - 9)</option>
            <option>Upper Elementary / Class 2 - 5 (Ages 9 - 12)</option>
          </select>

          <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
            <Plus size={16} /> Add Schedule Slot
          </Button>
        </div>
      </div>

      {/* Routine Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="text-[#006B5D]" size={16} />
            Daily Routine Timetable for {selectedClass}
          </CardTitle>
          <span className="text-xs text-[#667085] font-medium">{filteredSchedules.length} periods planned</span>
        </CardHeader>
        <CardContent>
          <ScheduleTimeline
            items={filteredSchedules}
            canDelete={true}
            onDelete={deleteScheduleItem}
          />
        </CardContent>
      </Card>

      {/* Create Schedule Item Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Daily Activity Slot</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Activity Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sensorial Work Cycle / Pink Tower"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Montessori Category</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ScheduleCategory)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
              >
                <option value="circle_time">Morning Circle Time</option>
                <option value="live_class">Live Online Teaching</option>
                <option value="sensorial">Practical Life / Sensorial Work Period</option>
                <option value="phonics">Language Arts</option>
                <option value="math">Mathematics</option>
                <option value="snack_break">Snack Time & Table Grace</option>
                <option value="storytelling">Storybook Circle</option>
                <option value="art_craft">Cultural Studies / General Knowledge</option>
                <option value="outdoor_play">Gross Motor & Outdoor Play</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Start Time</Label>
                <Input
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  placeholder="09:00 AM"
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-[#344054]">End Time</Label>
                <Input
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  placeholder="09:45 AM"
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Description & Instructions</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="List learning objectives or materials required..."
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#006B5D] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isLiveCheck"
                checked={isLive}
                onChange={e => setIsLive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isLiveCheck" className="text-xs text-[#344054] cursor-pointer">
                Mark as Live Virtual Session (enables direct "Join Class" button)
              </Label>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


