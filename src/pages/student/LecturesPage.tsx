import { useState } from 'react';
import { Video, Search, Filter } from 'lucide-react';
import { VideoCard } from '@/components/shared/VideoCard';
import { Input } from '@/components/ui/input';
import { LiveClassBanner } from '@/components/shared/LiveClassBanner';
import { useData } from '@/context/DataContext';

export const StudentLecturesPage: React.FC = () => {
  const { lessons } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <LiveClassBanner />

      <div>
        <h1 className="text-2xl font-bold text-[#101828]">Montessori Video Lectures & Rhymes</h1>
        <p className="text-sm text-[#667085]">Watch phonics songs, sensorial demonstrations, and counting rhymes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-[#667085]" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lessons & rhymes..."
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
                  ? 'bg-[#006B5D] text-white shadow-sm'
                  : 'bg-slate-50 text-[#344054] hover:bg-slate-100'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredLessons.map(lesson => (
          <VideoCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};
