import { useMemo, useState } from 'react';
import { BookOpenCheck, ClipboardCheck, Plus, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { useData } from '@/context/DataContext';
import { MONTESSORI_CLASSES, todayISO } from '@/lib/utils';

type CurriculumItem = { id: string; className: string; area: string; objective: string; material: string; status: 'planned' | 'observing' | 'mastered'; date: string };

const key = 'kg_curriculum_scope';
const read = (): CurriculumItem[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as CurriculumItem[] : [];
  } catch {
    return [];
  }
};

const defaults: CurriculumItem[] = [
  { id: 'cur-1', className: 'Early Childhood / Toddler (Ages 1.5 - 3)', area: 'Practical Life', objective: 'Pouring, spooning, sorting, and care of environment', material: 'Pouring jugs, trays, grain bowls', status: 'observing', date: todayISO() },
  { id: 'cur-2', className: 'Primary Montessori / Playgroup & Nursery (Ages 3 - 6)', area: 'Sensorial', objective: 'Visual discrimination by size, color, and dimension', material: 'Pink tower, brown stair, knobbed cylinders', status: 'planned', date: todayISO() },
  { id: 'cur-3', className: 'Upper Elementary / Class 2 - 5 (Ages 9 - 12)', area: 'Language Arts', objective: 'Phonetic blending and early word building', material: 'Sandpaper letters, moveable alphabet', status: 'mastered', date: todayISO() },
];

export const CurriculumPage: React.FC = () => {
  const { students, tests, remarks, schedules } = useData();
  const [items, setItems] = useState<CurriculumItem[]>(() => read().length ? read() : defaults);
  const [className, setClassName] = useState<string>(MONTESSORI_CLASSES[0]);
  const [area, setArea] = useState('Practical Life');
  const [objective, setObjective] = useState('');
  const [material, setMaterial] = useState('');

  const save = (next: CurriculumItem[]) => {
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    save([{ id: `cur-${Date.now()}`, className, area, objective: objective.trim(), material: material.trim(), status: 'planned', date: todayISO() }, ...items]);
    setObjective('');
    setMaterial('');
  };

  const cycle = (id: string) => save(items.map(i => i.id === id ? {
    ...i,
    status: i.status === 'planned' ? 'observing' : i.status === 'observing' ? 'mastered' : 'planned',
  } : i));

  const byClass = useMemo(() => MONTESSORI_CLASSES.map(c => ({
    name: c,
    students: students.filter(s => s.class === c).length,
    lessons: schedules.filter(s => s.class === c).length,
    objectives: items.filter(i => i.className === c).length,
  })), [students, schedules, items]);

  const mastered = items.filter(i => i.status === 'mastered').length;
  const observations = remarks.length + tests.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Montessori Curriculum</h1>
        <p className="text-sm text-[#667085]">Scope and sequence planning with class-linked observations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Curriculum Goals" value={String(items.length)} subtitle="Stored locally per browser" icon={<Target size={20} className="text-[#006B5D]" />} />
        <StatCard title="Mastered Goals" value={String(mastered)} subtitle={`${items.length ? Math.round((mastered / items.length) * 100) : 0}% complete`} icon={<BookOpenCheck size={20} className="text-[#006B5D]" />} />
        <StatCard title="Observation Evidence" value={String(observations)} subtitle="Remarks + assessments" icon={<ClipboardCheck size={20} className="text-[#006B5D]" />} />
        <StatCard title="Active Cohorts" value={String(byClass.filter(c => c.students).length)} subtitle={`${students.length} enrolled children`} icon={<Plus size={20} className="text-[#006B5D]" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Add Learning Objective</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={add} className="space-y-3">
              <div><Label className="text-xs">Cohort</Label><select value={className} onChange={e => setClassName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs">{MONTESSORI_CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><Label className="text-xs">Area</Label><Input value={area} onChange={e => setArea(e.target.value)} className="mt-1 text-xs" /></div>
              <div><Label className="text-xs">Objective</Label><Input value={objective} onChange={e => setObjective(e.target.value)} className="mt-1 text-xs" /></div>
              <div><Label className="text-xs">Materials</Label><Input value={material} onChange={e => setMaterial(e.target.value)} className="mt-1 text-xs" /></div>
              <Button type="submit" className="w-full gap-2"><Plus size={14} /> Save Objective</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Scope & Sequence</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.map(i => (
              <button key={i.id} onClick={() => cycle(i.id)} className="w-full rounded-lg border border-slate-100 bg-white p-3 text-left transition hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-bold text-[#101828]">{i.objective}</p><p className="text-xs text-[#667085]">{i.className} - {i.area} - {i.material || 'Materials TBD'}</p></div>
                  <Badge className={i.status === 'mastered' ? 'bg-emerald-50 text-emerald-700' : i.status === 'observing' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}>{i.status}</Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Cohort Coverage</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {byClass.map(c => <div key={c.name} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><p className="text-sm font-bold text-[#101828]">{c.name}</p><p className="text-xs text-[#667085]">{c.students} students - {c.objectives} objectives - {c.lessons} schedule items</p></div>)}
        </CardContent>
      </Card>
    </div>
  );
};


