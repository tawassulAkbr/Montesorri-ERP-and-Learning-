import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Search, Filter, Play, ExternalLink } from 'lucide-react';
import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import type { Lesson } from '@/types';

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

export const LessonsPage: React.FC = () => {
  const { lessons, addLesson } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Phonics & Language');
  const [targetClass, setTargetClass] = useState('Junior Montessori (Nursery)');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState('08:00');
  const [description, setDescription] = useState('');

  const extractedId = extractYouTubeId(youtubeUrl);
  const previewThumbnail = extractedId && extractedId.length === 11
    ? `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`
    : null;

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return;

    addLesson({
      title,
      subject,
      class: targetClass,
      teacherId: 't1',
      teacherName: 'Maria Montessori',
      youtubeId: extractedId,
      description,
      duration,
    });

    setOpenModal(false);
    setTitle('');
    setYoutubeUrl('');
    setDescription('');
  };

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Montessori Video Lessons & Rhymes</h1>
          <p className="text-sm text-slate-500">Publish video lessons, phonics rhymes, and sensorial exercises for students & parents</p>
        </div>

        <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Upload New Lesson
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Phonics & Language', 'Sensorial & Practical Life', 'Early Mathematics', 'Rhymes & Story Circle', 'Creative Arts & Crafts'].map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === subj
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <Video className="mx-auto text-slate-300 mb-2" size={40} />
          <p className="text-sm font-semibold text-slate-700">No lessons found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or subject filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredLessons.map(lesson => (
            <VideoCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}

      {/* Upload Lesson Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="text-indigo-600" size={20} />
              Upload Montessori Video Lecture
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">Lesson Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Phonics Letter Sounds /c/ /k/ /e/"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Learning Area</Label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Phonics & Language</option>
                  <option>Sensorial & Practical Life</option>
                  <option>Early Mathematics</option>
                  <option>Rhymes & Story Circle</option>
                  <option>Creative Arts & Crafts</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Target Cohort</Label>
                <select
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Montessori Toddler (Playgroup)</option>
                  <option>Junior Montessori (Nursery)</option>
                  <option>Senior Montessori (Prep)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">YouTube Video Link or ID</Label>
              <Input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                className="mt-1 text-xs"
                required
              />
            </div>

            {previewThumbnail && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Play size={12} className="text-indigo-600" /> Video Thumbnail Detected
                </p>
                <div className="aspect-video w-full rounded-lg overflow-hidden relative shadow-inner">
                  <img
                    src={previewThumbnail}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-600">Duration (MM:SS)</Label>
                <Input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="08:30"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">Parent & Child Activity Instructions</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Suggested home materials (sand tray, clay, counters)..."
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish to Portal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
