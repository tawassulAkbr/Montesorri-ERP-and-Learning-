import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  age: number;
  classroom: string;
  parent: string;
  parentEmail: string;
  enrollDate: string;
  level: string;
  avatar: string;
}

const dummyStudents: Student[] = [
  { id: '1', name: 'Emma Thompson', age: 4, classroom: 'Sunflower', parent: 'Laura Thompson', parentEmail: 'laura@email.com', enrollDate: '2025-01-10', level: 'Primary', avatar: '🧒' },
  { id: '2', name: 'Liam Garcia', age: 3, classroom: 'Daisy', parent: 'Maria Garcia', parentEmail: 'maria@email.com', enrollDate: '2025-03-15', level: 'Toddler', avatar: '👦' },
  { id: '3', name: 'Sophia Patel', age: 5, classroom: 'Sunflower', parent: 'Raj Patel', parentEmail: 'raj@email.com', enrollDate: '2024-09-01', level: 'Primary', avatar: '👧' },
  { id: '4', name: 'Noah Kim', age: 6, classroom: 'Oak', parent: 'Soo Kim', parentEmail: 'soo@email.com', enrollDate: '2024-06-20', level: 'Elementary', avatar: '🧑' },
  { id: '5', name: 'Ava Williams', age: 3, classroom: 'Daisy', parent: 'Jessica Williams', parentEmail: 'jessica@email.com', enrollDate: '2025-06-01', level: 'Toddler', avatar: '👶' },
  { id: '6', name: 'Oliver Johnson', age: 5, classroom: 'Sunflower', parent: 'Mark Johnson', parentEmail: 'mark@email.com', enrollDate: '2024-08-15', level: 'Primary', avatar: '🧒' },
  { id: '7', name: 'Isabella Lee', age: 4, classroom: 'Sunflower', parent: 'David Lee', parentEmail: 'david@email.com', enrollDate: '2025-02-01', level: 'Primary', avatar: '👧' },
  { id: '8', name: 'Ethan Brown', age: 7, classroom: 'Oak', parent: 'Amy Brown', parentEmail: 'amy@email.com', enrollDate: '2023-09-01', level: 'Elementary', avatar: '👦' },
];

export default function Students() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = dummyStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.classroom.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'All' || s.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Student Directory</h1>
          <p className="text-surface-500 text-sm mt-1">Manage enrolled students and their details</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students or classrooms..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {['All', 'Toddler', 'Primary', 'Elementary'].map(level => (
            <button key={level} onClick={() => setLevelFilter(level)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${levelFilter === level ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(student => (
          <div key={student.id} className="bg-white rounded-2xl border border-surface-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={() => setSelectedStudent(student)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{student.avatar}</div>
              <div>
                <h3 className="font-bold text-surface-900">{student.name}</h3>
                <p className="text-xs text-surface-500">Age {student.age}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Classroom</span>
                <span className="font-medium text-surface-800">{student.classroom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Level</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${student.level === 'Toddler' ? 'bg-pink-100 text-pink-700' : student.level === 'Primary' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{student.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Parent</span>
                <span className="font-medium text-surface-800 truncate ml-2">{student.parent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">{selectedStudent.avatar}</div>
              <div>
                <h3 className="text-2xl font-bold text-surface-900">{selectedStudent.name}</h3>
                <p className="text-surface-500">Age {selectedStudent.age} • {selectedStudent.level}</p>
              </div>
            </div>
            <div className="space-y-3 bg-surface-50 rounded-xl p-4">
              <div className="flex justify-between"><span className="text-surface-500">Classroom</span><span className="font-medium">{selectedStudent.classroom}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Parent/Guardian</span><span className="font-medium">{selectedStudent.parent}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Parent Email</span><span className="font-medium text-brand-600">{selectedStudent.parentEmail}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Enrolled</span><span className="font-medium">{selectedStudent.enrollDate}</span></div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> View Progress</button>
              <button className="px-4 py-3 rounded-xl border border-surface-200 text-surface-700 hover:bg-surface-50"><Edit className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setSelectedStudent(null)} className="w-full mt-3 text-sm text-surface-500 hover:text-surface-700">Close</button>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Enroll New Student</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Student Full Name" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="number" placeholder="Age" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>Daisy (Toddler)</option>
                <option>Sunflower (Primary)</option>
                <option>Oak (Elementary)</option>
              </select>
              <input type="text" placeholder="Parent/Guardian Name" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="email" placeholder="Parent Email" className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-surface-700 font-semibold hover:bg-surface-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600">Enroll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
