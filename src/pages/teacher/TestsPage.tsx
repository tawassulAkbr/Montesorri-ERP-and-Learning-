import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, Calendar, Award, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Test, TestResult } from '@/types';

function gradeFromPercent(pct: number): TestResult['grade'] {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function milestoneFromPercent(pct: number): TestResult['milestoneStatus'] {
  if (pct >= 85) return 'Mastered';
  if (pct >= 60) return 'Developing';
  return 'Emerging';
}

export const TestsPage: React.FC = () => {
  const { tests, students, testResults, addTest, saveTestResults } = useData();
  const { currentUser } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [evalScores, setEvalScores] = useState<Record<string, string>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Phonics & Early Language');
  const [targetClass, setTargetClass] = useState('Junior Montessori (Nursery)');
  const [date, setDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(20);
  const [instructions, setInstructions] = useState('');

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    addTest({
      title,
      subject,
      class: targetClass,
      teacherId: currentUser?.id ?? '',
      date,
      maxMarks,
      instructions,
    });

    setOpenModal(false);
    setTitle('');
    setDate('');
    setInstructions('');
  };

  const openEvaluation = (test: Test) => {
    const existing = Object.fromEntries(
      testResults
        .filter(r => r.testId === test.id)
        .map(r => [r.studentId, String(r.marksObtained)])
    );
    setEvalScores(existing);
    setSelectedTest(test);
  };

  const handleSaveResults = () => {
    if (!selectedTest) return;
    const classStudents = students.filter(s => s.class === selectedTest.class);
    const results = classStudents
      .filter(s => evalScores[s.id] !== undefined && evalScores[s.id] !== '')
      .map(s => {
        const marks = Math.max(0, Math.min(selectedTest.maxMarks, Number(evalScores[s.id])));
        const pct = (marks / selectedTest.maxMarks) * 100;
        return {
          studentId: s.id,
          marksObtained: marks,
          grade: gradeFromPercent(pct),
          milestoneStatus: milestoneFromPercent(pct),
        };
      });
    if (results.length === 0) return;
    saveTestResults(selectedTest.id, results);
    setSelectedTest(null);
  };

  const getStatusBadge = (status: Test['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-[#E6F4F1] text-[#006B5D] border-[#B7DDD6]">Upcoming Milestone</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Evaluating</Badge>;
      case 'evaluated':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Mastered</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Developmental Milestones & Observations</h1>
          <p className="text-sm text-[#667085]">Track early childhood learning milestones, sensorial evaluations, and fine motor skills</p>
        </div>

        <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Schedule Milestone Evaluation
        </Button>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-semibold text-sm text-[#101828]">Scheduled Developmental Milestones ({tests.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">Milestone Area</th>
                <th className="p-3.5">Learning Domain</th>
                <th className="p-3.5">Class Cohort</th>
                <th className="p-3.5">Target Date</th>
                <th className="p-3.5">Max Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5 font-semibold text-[#101828]">{test.title}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#344054] font-medium">
                      {test.subject}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#344054]">{test.class}</td>
                  <td className="p-3.5 text-[#344054]">{formatDate(test.date)}</td>
                  <td className="p-3.5 font-mono text-[#344054]">{test.maxMarks} pts</td>
                  <td className="p-3.5">{getStatusBadge(test.status)}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEvaluation(test)}
                      className="text-xs text-[#006B5D] hover:text-[#006B5D]"
                    >
                      Evaluation Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Test Dialog */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="text-[#006B5D]" size={20} />
              Schedule Developmental Milestone
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTest} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Milestone Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 3-Letter Phonetic Word Blending"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Learning Area</Label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Phonics & Early Language</option>
                  <option>Sensorial & Practical Life</option>
                  <option>Early Mathematics</option>
                  <option>Rhymes & Story Circle</option>
                  <option>Creative Arts & Crafts</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium text-[#344054]">Class</Label>
                <select
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Montessori Toddler (Playgroup)</option>
                  <option>Junior Montessori (Nursery)</option>
                  <option>Senior Montessori (Prep)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Observation Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-[#344054]">Max Rubric Score</Label>
                <Input
                  type="number"
                  value={maxMarks}
                  onChange={e => setMaxMarks(Number(e.target.value))}
                  className="mt-1 text-xs"
                  min={5}
                  max={50}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Observation Rubric / Criteria</Label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={3}
                placeholder="Specify materials observed (sandpaper letters, knobbed cylinders, spindle box)..."
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#006B5D] resize-none"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Milestone</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTest.title}</span>
                {getStatusBadge(selectedTest.status)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-[#667085]">Area:</span>
                  <p className="font-semibold text-[#344054]">{selectedTest.subject}</p>
                </div>
                <div>
                  <span className="text-[#667085]">Cohort:</span>
                  <p className="font-semibold text-[#344054]">{selectedTest.class}</p>
                </div>
                <div>
                  <span className="text-[#667085]">Date:</span>
                  <p className="font-semibold text-[#344054]">{formatDate(selectedTest.date)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
                  Toddler Milestone Observations — {selectedTest.class}
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[#667085]">
                      <tr>
                        <th className="p-2.5 pl-4">Child</th>
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Score (/{selectedTest.maxMarks})</th>
                        <th className="p-2.5 pr-4 text-right">Milestone Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.class === selectedTest.class).map(stu => {
                        const val = evalScores[stu.id] ?? '';
                        const pct = val !== '' ? (Number(val) / selectedTest.maxMarks) * 100 : null;
                        return (
                          <tr key={stu.id} className="hover:bg-slate-50">
                            <td className="p-2.5 pl-4 font-medium text-[#101828]">{stu.name}</td>
                            <td className="p-2.5 text-[#667085] font-mono">#{stu.rollNo}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                min={0}
                                max={selectedTest.maxMarks}
                                value={val}
                                onChange={e => setEvalScores(prev => ({ ...prev, [stu.id]: e.target.value }))}
                                className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#006B5D]"
                              />
                            </td>
                            <td className="p-2.5 pr-4 text-right">
                              {pct === null ? (
                                <span className="text-[#667085] text-[10px]">Not entered</span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  pct >= 85 ? 'bg-emerald-50 text-emerald-700'
                                  : pct >= 60 ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-600'
                                }`}>
                                  {milestoneFromPercent(pct)} · {gradeFromPercent(pct)}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTest(null)}>Close</Button>
              <Button onClick={handleSaveResults}>Save Evaluation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
