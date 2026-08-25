import React, { useState } from 'react';
import { Check, X, Clock, Users, Calendar } from 'lucide-react';

interface StudentAttendance {
  id: string;
  name: string;
  classroom: string;
  status: 'present' | 'absent' | 'late' | 'unmarked';
  avatar: string;
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const initialStudents: StudentAttendance[] = [
  { id: '1', name: 'Emma Thompson', classroom: 'Sunflower', status: 'unmarked', avatar: '🧒' },
  { id: '2', name: 'Liam Garcia', classroom: 'Daisy', status: 'unmarked', avatar: '👦' },
  { id: '3', name: 'Sophia Patel', classroom: 'Sunflower', status: 'unmarked', avatar: '👧' },
  { id: '4', name: 'Noah Kim', classroom: 'Oak', status: 'unmarked', avatar: '🧑' },
  { id: '5', name: 'Ava Williams', classroom: 'Daisy', status: 'unmarked', avatar: '👶' },
  { id: '6', name: 'Oliver Johnson', classroom: 'Sunflower', status: 'unmarked', avatar: '🧒' },
  { id: '7', name: 'Isabella Lee', classroom: 'Sunflower', status: 'unmarked', avatar: '👧' },
  { id: '8', name: 'Ethan Brown', classroom: 'Oak', status: 'unmarked', avatar: '👦' },
];

export default function Attendance() {
  const [students, setStudents] = useState<StudentAttendance[]>(initialStudents);
  const [classFilter, setClassFilter] = useState('All');
  const [saved, setSaved] = useState(false);

  const classrooms = ['All', ...Array.from(new Set(students.map(s => s.classroom)))];
  const filtered = students.filter(s => classFilter === 'All' || s.classroom === classFilter);

  const markStatus = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSaved(false);
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => {
      if (classFilter === 'All' || s.classroom === classFilter) {
        return { ...s, status: 'present' };
      }
      return s;
    }));
    setSaved(false);
  };

  const present = students.filter(s => s.status === 'present').length;
  const absent = students.filter(s => s.status === 'absent').length;
  const late = students.filter(s => s.status === 'late').length;
  const unmarked = students.filter(s => s.status === 'unmarked').length;

  const statusBtnClass = (current: string, target: string) => {
    if (current === target) {
      const map: Record<string, string> = {
        present: 'bg-green-500 text-white shadow-sm',
        absent: 'bg-red-500 text-white shadow-sm',
        late: 'bg-yellow-500 text-white shadow-sm',
      };
      return map[target];
    }
    return 'bg-surface-100 text-surface-500 hover:bg-surface-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Smart Attendance</h1>
          <p className="text-surface-500 text-sm mt-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> {today}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={markAllPresent} className="bg-white border border-surface-200 text-surface-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-surface-50 transition-all text-sm">
            Mark All Present
          </button>
          <button onClick={() => setSaved(true)} className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${saved ? 'bg-green-500 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'}`}>
            {saved ? '✓ Saved' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-surface-200 text-center">
          <p className="text-2xl font-bold text-green-600">{present}</p>
          <p className="text-xs text-surface-500 font-medium">Present</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200 text-center">
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-xs text-surface-500 font-medium">Absent</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200 text-center">
          <p className="text-2xl font-bold text-yellow-600">{late}</p>
          <p className="text-xs text-surface-500 font-medium">Late</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200 text-center">
          <p className="text-2xl font-bold text-surface-400">{unmarked}</p>
          <p className="text-xs text-surface-500 font-medium">Unmarked</p>
        </div>
      </div>

      {/* Classroom Filter */}
      <div className="flex gap-2 flex-wrap">
        {classrooms.map(c => (
          <button key={c} onClick={() => setClassFilter(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${classFilter === c ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
            {c === 'All' ? 'All Classes' : c}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filtered.map(student => (
          <div key={student.id} className={`bg-white rounded-xl border p-4 flex items-center justify-between transition-all ${student.status === 'present' ? 'border-green-200 bg-green-50/30' : student.status === 'absent' ? 'border-red-200 bg-red-50/30' : student.status === 'late' ? 'border-yellow-200 bg-yellow-50/30' : 'border-surface-200'}`}>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{student.avatar}</div>
              <div>
                <p className="font-bold text-surface-900">{student.name}</p>
                <p className="text-xs text-surface-500">{student.classroom}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => markStatus(student.id, 'present')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${statusBtnClass(student.status, 'present')}`} title="Present">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => markStatus(student.id, 'late')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${statusBtnClass(student.status, 'late')}`} title="Late">
                <Clock className="w-5 h-5" />
              </button>
              <button onClick={() => markStatus(student.id, 'absent')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${statusBtnClass(student.status, 'absent')}`} title="Absent">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
