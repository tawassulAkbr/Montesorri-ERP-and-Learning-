import React, { useState } from 'react';
import { Plus, Clock, BookOpen, Users, CheckCircle, ChevronRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  area: string;
  materials: string;
  duration: string;
  students: string[];
  status: 'planned' | 'in-progress' | 'completed';
  date: string;
  notes: string;
}

const montessoriAreas = ['Practical Life', 'Sensorial', 'Language', 'Mathematics', 'Culture & Science', 'Art & Music'];

const dummyLessons: Lesson[] = [
  { id: '1', title: 'Pouring Exercise', area: 'Practical Life', materials: 'Small pitcher, cup, tray, sponge', duration: '15 min', students: ['Emma', 'Liam', 'Ava'], status: 'completed', date: '2026-08-25', notes: 'Emma excelled at controlled pouring. Liam needs more practice with grip.' },
  { id: '2', title: 'Pink Tower', area: 'Sensorial', materials: 'Pink Tower (10 cubes)', duration: '20 min', students: ['Sophia', 'Oliver', 'Isabella'], status: 'in-progress', date: '2026-08-25', notes: '' },
  { id: '3', title: 'Sandpaper Letters', area: 'Language', materials: 'Sandpaper letters a-z, sand tray', duration: '15 min', students: ['Emma', 'Noah'], status: 'planned', date: '2026-08-25', notes: '' },
  { id: '4', title: 'Number Rods', area: 'Mathematics', materials: 'Number rods 1-10, felt mat', duration: '20 min', students: ['Sophia', 'Ethan', 'Oliver', 'Isabella'], status: 'planned', date: '2026-08-25', notes: '' },
  { id: '5', title: 'Continent Globe', area: 'Culture & Science', materials: 'Continent globe, continent cards', duration: '25 min', students: ['Noah', 'Ethan'], status: 'planned', date: '2026-08-26', notes: '' },
  { id: '6', title: 'Watercolor Painting', area: 'Art & Music', materials: 'Watercolors, brushes, paper, apron', duration: '30 min', students: ['Emma', 'Ava', 'Liam', 'Isabella'], status: 'planned', date: '2026-08-26', notes: '' },
];

const areaColors: Record<string, string> = {
  'Practical Life': 'bg-green-100 text-green-700 border-green-200',
  'Sensorial': 'bg-pink-100 text-pink-700 border-pink-200',
  'Language': 'bg-blue-100 text-blue-700 border-blue-200',
  'Mathematics': 'bg-purple-100 text-purple-700 border-purple-200',
  'Culture & Science': 'bg-orange-100 text-orange-700 border-orange-200',
  'Art & Music': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function Lessons() {
  const [selectedArea, setSelectedArea] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const filtered = dummyLessons.filter(l => selectedArea === 'All' || l.area === selectedArea);

  const todayLessons = filtered.filter(l => l.date === '2026-08-25');
  const upcomingLessons = filtered.filter(l => l.date !== '2026-08-25');

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    planned: { color: 'bg-blue-100 text-blue-700', icon: Clock },
    'in-progress': { color: 'bg-yellow-100 text-yellow-700', icon: BookOpen },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Lesson Planner</h1>
          <p className="text-surface-500 text-sm mt-1">Plan and track Montessori curriculum lessons</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Lesson
        </button>
      </div>

      {/* Area Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedArea('All')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedArea === 'All' ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
          All Areas
        </button>
        {montessoriAreas.map(area => (
          <button key={area} onClick={() => setSelectedArea(area)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedArea === area ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
            {area}
          </button>
        ))}
      </div>

      {/* Today's Lessons */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 mb-4">📅 Today's Lessons</h2>
        <div className="space-y-3">
          {todayLessons.map(lesson => {
            const config = statusConfig[lesson.status];
            const StatusIcon = config.icon;
            return (
              <div key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="bg-white rounded-xl border border-surface-200 p-5 flex items-center justify-between hover:shadow-md hover:border-brand-200 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${areaColors[lesson.area]}`}>
                    {lesson.area}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900">{lesson.title}</h3>
                    <p className="text-sm text-surface-500">{lesson.duration} • {lesson.students.length} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />{lesson.status.replace('-', ' ')}
                  </span>
                  <ChevronRight className="w-5 h-5 text-surface-300" />
                </div>
              </div>
            );
          })}
          {todayLessons.length === 0 && <p className="text-surface-500 text-center py-8">No lessons scheduled for today in this area.</p>}
        </div>
      </div>

      {/* Upcoming Lessons */}
      {upcomingLessons.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-surface-900 mb-4">🔮 Upcoming</h2>
          <div className="space-y-3">
            {upcomingLessons.map(lesson => (
              <div key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="bg-white rounded-xl border border-surface-200 p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer opacity-80 hover:opacity-100">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${areaColors[lesson.area]}`}>{lesson.area}</div>
                  <div>
                    <h3 className="font-bold text-surface-900">{lesson.title}</h3>
                    <p className="text-sm text-surface-500">{lesson.date} • {lesson.students.length} students</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLesson(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border mb-4 ${areaColors[selectedLesson.area]}`}>{selectedLesson.area}</div>
            <h3 className="text-2xl font-bold text-surface-900 mb-1">{selectedLesson.title}</h3>
            <p className="text-surface-500 mb-6">{selectedLesson.date} • {selectedLesson.duration}</p>
            <div className="space-y-4">
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-surface-500 uppercase mb-2">Materials Needed</p>
                <p className="text-surface-800">{selectedLesson.materials}</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-surface-500 uppercase mb-2">Students ({selectedLesson.students.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLesson.students.map(s => (
                    <span key={s} className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-surface-200">{s}</span>
                  ))}
                </div>
              </div>
              {selectedLesson.notes && (
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                  <p className="text-xs font-semibold text-brand-600 uppercase mb-2">Observation Notes</p>
                  <p className="text-surface-800 text-sm">{selectedLesson.notes}</p>
                </div>
              )}
            </div>
            <button onClick={() => setSelectedLesson(null)} className="w-full mt-6 px-4 py-3 rounded-xl border border-surface-200 text-surface-700 font-semibold hover:bg-surface-50">Close</button>
          </div>
        </div>
      )}

      {/* Create Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-6">Create New Lesson</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Lesson Title" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                {montessoriAreas.map(a => <option key={a}>{a}</option>)}
              </select>
              <input type="text" placeholder="Materials (comma separated)" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="text" placeholder="Duration (e.g. 20 min)" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <textarea placeholder="Notes / Plan" rows={3} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-surface-700 font-semibold hover:bg-surface-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600">Create Lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
