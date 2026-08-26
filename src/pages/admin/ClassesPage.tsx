import { useState } from 'react';
import { BookMarked, Plus, Users, GraduationCap, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClassItem {
  id: string;
  name: string;
  section: string;
  studentsCount: number;
  classTeacher: string;
  subjects: string[];
}

const initialClasses: ClassItem[] = [
  { id: 'c1', name: 'Grade 5', section: 'A', studentsCount: 24, classTeacher: 'Sarah Mitchell', subjects: ['Math', 'English', 'Science', 'Arabic', 'Art'] },
  { id: 'c2', name: 'Grade 5', section: 'B', studentsCount: 22, classTeacher: 'James Harrison', subjects: ['Math', 'English', 'Science', 'Arabic'] },
  { id: 'c3', name: 'Grade 6', section: 'A', studentsCount: 26, classTeacher: 'Fatima Al-Rashid', subjects: ['Math', 'English', 'Science', 'Social Studies'] },
  { id: 'c4', name: 'Grade 6', section: 'B', studentsCount: 20, classTeacher: 'Omar Sheikh', subjects: ['Math', 'English', 'Science', 'Arabic'] },
];

export const AdminClassesPage: React.FC = () => {
  const [classesList, setClassesList] = useState<ClassItem[]>(initialClasses);
  const [openModal, setOpenModal] = useState(false);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('Sarah Mitchell');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !section) return;

    const newClass: ClassItem = {
      id: `class-${Date.now()}`,
      name: className,
      section,
      studentsCount: 0,
      classTeacher: teacher,
      subjects: ['Math', 'English', 'Science'],
    };

    setClassesList([...classesList, newClass]);
    setOpenModal(false);
    setClassName('');
    setSection('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classrooms & Sections</h1>
          <p className="text-sm text-slate-500">Manage academic cohorts, assign lead teachers, and monitor cohort enrollment</p>
        </div>

        <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Create New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classesList.map(cls => (
          <Card key={cls.id} className="border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <CardHeader className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">{cls.name} — Section {cls.section}</h3>
                <p className="text-xs text-slate-400">Class Lead: {cls.classTeacher}</p>
              </div>
              <Badge className="bg-indigo-600 text-white text-xs">
                {cls.studentsCount} Students
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                  Curriculum Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cls.subjects.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>

            <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Term 1 Active</span>
              <div className="space-x-1">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Manage Roster
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Academic Cohort</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">Grade Level</Label>
              <Input
                value={className}
                onChange={e => setClassName(e.target.value)}
                placeholder="e.g. Grade 7"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">Section</Label>
              <Input
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="e.g. A"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">Assign Class Teacher</Label>
              <select
                value={teacher}
                onChange={e => setTeacher(e.target.value)}
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Sarah Mitchell</option>
                <option>James Harrison</option>
                <option>Fatima Al-Rashid</option>
                <option>Omar Sheikh</option>
                <option>Priya Sharma</option>
              </select>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Class</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
