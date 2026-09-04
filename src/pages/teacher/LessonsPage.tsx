import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Search, Filter, Play, Upload } from 'lucide-react';
import { VideoCard } from '@/components/shared/VideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile } from '@/lib/api';

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

export const LessonsPage: React.FC = () => {
  const { lessons, addLesson } = useData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [openModal, setOpenModal] = useState(false);

  // Form State
  const [sourceMode, setSourceMode] = useState<'youtube' | 'upload'>('youtube');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Language Arts');
  const [targetClass, setTargetClass] = useState('Primary Montessori / Playgroup & Nursery (Ages 3 - 6)');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState('08:00');
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const extractedId = sourceMode === 'youtube' ? extractYouTubeId(youtubeUrl) : null;
  const previewThumbnail = extractedId && extractedId.length === 11
    ? `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`
    : null;

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title) return;

    if (sourceMode === 'youtube' && !youtubeUrl) {
      setError('Please provide a YouTube link.');
      return;
    }
    if (sourceMode === 'upload' && !videoFile) {
      setError('Please choose a video file to upload.');
      return;
    }

    setPublishing(true);
    try {
      let youtubeId: string | undefined;
      let videoUrl: string | undefined;

      if (sourceMode === 'youtube') {
        youtubeId = extractedId ?? undefined;
      } else if (videoFile) {
        const uploaded = await uploadFile(videoFile);
        videoUrl = uploaded.url;
      }

      await addLesson({
        title,
        subject,
        class: targetClass,
        teacherId: currentUser?.id ?? '',
        teacherName: currentUser?.name ?? '',
        youtubeId,
        videoUrl,
        description,
        duration,
      });

      setOpenModal(false);
      setTitle('');
      setYoutubeUrl('');
      setVideoFile(null);
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish lesson.');
    } finally {
      setPublishing(false);
    }
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
          <h1 className="text-2xl font-bold text-[#101828]">Montessori Video Lessons & Rhymes</h1>
          <p className="text-sm text-[#667085]">Publish video lessons, phonics rhymes, and sensorial exercises for students & parents</p>
        </div>

        <Button onClick={() => setOpenModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Upload New Lesson
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Practical Life', 'Sensorial', 'Language Arts', 'Mathematics', 'Cultural Studies / General Knowledge', 'Islamiyat'].map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === subj
                  ? 'bg-[#006B5D] text-white shadow-sm'
                  : 'bg-slate-50 text-[#344054] hover:bg-slate-100'
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
          <p className="text-sm font-semibold text-[#344054]">No lessons found</p>
          <p className="text-xs text-[#667085]">Try adjusting your search query or subject filters.</p>
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
              <Video className="text-[#006B5D]" size={20} />
              Upload Montessori Video Lecture
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-[#344054]">Lesson Title</Label>
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
                <Label className="text-xs font-medium text-[#344054]">Learning Area</Label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Practical Life</option>
                  <option>Sensorial</option>
                  <option>Language Arts</option>
                  <option>Mathematics</option>
                  <option>Cultural Studies / General Knowledge</option>
                  <option>Islamiyat</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-medium text-[#344054]">Target Cohort</Label>
                <select
                  value={targetClass}
                  onChange={e => setTargetClass(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#006B5D]"
                >
                  <option>Early Childhood / Toddler (Ages 1.5 - 3)</option>
                  <option>Primary Montessori / Playgroup & Nursery (Ages 3 - 6)</option>
                  <option>Lower Elementary / Prep & Class 1 (Ages 6 - 9)</option>
                  <option>Upper Elementary / Class 2 - 5 (Ages 9 - 12)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Video Source</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSourceMode('youtube')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    sourceMode === 'youtube'
                      ? 'bg-[#006B5D] text-white border-[#006B5D]'
                      : 'bg-white text-[#344054] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  YouTube Link
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    sourceMode === 'upload'
                      ? 'bg-[#006B5D] text-white border-[#006B5D]'
                      : 'bg-white text-[#344054] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Upload My Video
                </button>
              </div>
            </div>

            {sourceMode === 'youtube' ? (
              <>
                <div>
                  <Label className="text-xs font-medium text-[#344054]">YouTube Video Link or ID</Label>
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
                    <p className="text-[11px] font-semibold text-[#344054] flex items-center gap-1">
                      <Play size={12} className="text-[#006B5D]" /> Video Thumbnail Detected
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
              </>
            ) : (
              <div>
                <Label className="text-xs font-medium text-[#344054]">Your Recorded Video (max 25 MB)</Label>
                <label className="mt-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-4 text-xs text-[#667085] cursor-pointer hover:border-[#B7DDD6] hover:bg-[#E6F4F1]/30 transition-all">
                  <Upload size={15} className="text-[#006B5D]" />
                  {videoFile ? videoFile.name : 'Click to choose a video file (mp4, webm...)'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => setVideoFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#344054]">Duration (MM:SS)</Label>
                <Input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="08:30"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-[#344054]">Parent & Child Activity Instructions</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Suggested home materials (sand tray, clay, counters)..."
                className="w-full mt-1 text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#006B5D] resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish to Portal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


