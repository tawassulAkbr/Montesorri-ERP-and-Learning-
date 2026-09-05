import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Users, Hand, MessageSquare,
  Sparkles, PhoneOff, Send, Radio, ArrowRight, Calendar, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Whiteboard } from '@/components/shared/Whiteboard';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserMedia } from '@/hooks/useUserMedia';
import { MONTESSORI_CLASSES } from '@/lib/utils';

interface StudentHand {
  studentId: string;
  name: string;
  time: string;
}

export const TeacherLiveClassPage: React.FC = () => {
  const { liveClass, endLiveClass, students, teachers, startLiveClass, schedules } = useData();
  const { currentUser } = useAuth();
  const teacherName = currentUser?.name || 'Teacher';
  const myTeacherRecord = useMemo(
    () => teachers.find(t => t.id === currentUser?.id),
    [teachers, currentUser?.id]
  );
  const teacherClasses = useMemo(() => myTeacherRecord?.classes ?? [], [myTeacherRecord?.classes]);
  const defaultClass = teacherClasses[0] ?? MONTESSORI_CLASSES[0];

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [targetClass, setTargetClass] = useState<string>(defaultClass);
  const [startError, setStartError] = useState('');

  const participants = students.filter(s => s.class === liveClass.class);
  const { videoRef, hasStream, micOn, camOn, error: mediaError, requesting, start, stop, toggleMic, toggleCam } = useUserMedia();
  const [activeTab, setActiveTab] = useState<'participants' | 'hands' | 'chat'>('participants');
  const [raisedHands, setRaisedHands] = useState<StudentHand[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isTeacher?: boolean }[]>([]);
  const [newMsg, setNewMsg] = useState('');

  // Only request the camera/mic AFTER the class is actually live. The Start form
  // does not touch media so the page can sit idle without popping the permission
  // dialog every time the teacher lands here.
  useEffect(() => {
    if (liveClass.isActive) start();
  }, [liveClass.isActive, start]);

  // Upcoming scheduled items for this teacher — shown on the Start screen so the
  // teacher has context about what's planned.
  const upcoming = useMemo(() => {
    const mine = schedules.filter(s => teacherClasses.includes(s.class));
    return (mine.length ? mine : schedules).slice(0, 4);
  }, [schedules, teacherClasses]);

  const handleStartClass = () => {
    setStartError('');
    if (!topic.trim()) {
      setStartError('Please enter a topic for this live lesson.');
      return;
    }
    if (!subject.trim()) {
      setStartError('Please enter the subject being taught.');
      return;
    }
    if (!targetClass) {
      setStartError('Please pick a class to broadcast to.');
      return;
    }
    startLiveClass(topic.trim(), subject.trim(), targetClass, teacherName);
  };

  const handleEndClass = () => {
    stop();
    endLiveClass();
  };

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg) return;
    setChatMessages(prev => [...prev, { sender: teacherName, text: newMsg, isTeacher: true }]);
    setNewMsg('');
  };

  const dismissHand = (id: string) => {
    setRaisedHands(prev => prev.filter(h => h.studentId !== id));
  };

  // ─── Start Screen (no class in session) ──────────────────────────────────────
  if (!liveClass.isActive) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">Live Virtual Class</h1>
            <p className="text-sm text-[#667085]">Start a live lesson — students can join only after you begin broadcasting.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            No class is currently in session
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Start form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-xl bg-[#E6F4F1] text-[#006B5D] flex items-center justify-center">
                <Radio size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#101828]">Start a new live lesson</h2>
                <p className="text-xs text-[#667085]">Camera and microphone will turn on after you press Start.</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleStartClass(); }} className="space-y-4">
              <div>
                <Label htmlFor="topic" className="text-xs font-bold text-[#344054]">Lesson Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Phonics — Letter Sounds /s/ and /a/"
                  className="mt-1.5 h-11 rounded-xl border-[#EAECF0] bg-[#F9FAFB] px-4 text-sm focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1] focus-visible:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-xs font-bold text-[#344054]">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Language Arts"
                    className="mt-1.5 h-11 rounded-xl border-[#EAECF0] bg-[#F9FAFB] px-4 text-sm focus-visible:border-[#006B5D] focus-visible:ring-[#E6F4F1] focus-visible:bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cls" className="text-xs font-bold text-[#344054]">Class</Label>
                  <select
                    id="cls"
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#EAECF0] bg-[#F9FAFB] px-4 text-sm text-[#101828] outline-none focus:border-[#006B5D] focus:ring-4 focus:ring-[#E6F4F1] focus:bg-white"
                  >
                    {(teacherClasses.length > 0 ? teacherClasses : Array.from(MONTESSORI_CLASSES)).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {startError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                  {startError}
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#006B5D] text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(0,107,93,0.16)] hover:bg-[#005E54] gap-2"
                >
                  <Radio size={16} /> Start Live Class
                </Button>
                <span className="text-[11px] text-[#667085]">
                  Your camera and microphone will be requested only after you press Start.
                </span>
              </div>
            </form>
          </div>

          {/* Upcoming schedule + tip */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-[#006B5D]" />
                <h3 className="text-sm font-extrabold text-[#101828]">Upcoming on your schedule</h3>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-xs text-[#667085] py-2">Nothing scheduled for the coming days.</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map(s => (
                    <li key={s.id} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                      <div className="mt-0.5 h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#006B5D] border border-slate-200">
                        <Clock size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#101828] truncate">{s.title}</p>
                        <p className="text-[11px] text-[#667085] mt-0.5">
                          {s.class} · {s.startTime}–{s.endTime}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#013A33] via-[#006B5D] to-[#0A8B7A] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <Sparkles size={18} className="text-[#FBBF24] mb-2" />
              <h3 className="text-sm font-extrabold mb-1.5">Hosting a live class</h3>
              <p className="text-[11.5px] text-emerald-50/80 leading-relaxed">
                Once you start broadcasting, students in the chosen class will see a red <b>Join Live Class</b> banner on their dashboard and can join from the Live Classroom tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Live Classroom UI (class is in session) ────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Live Classroom Top Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                LIVE BROADCAST
              </span>
              <span className="text-xs text-slate-300 font-medium">{liveClass.class}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">{liveClass.topic}</h2>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={toggleMic}
            className={`h-9 px-3 text-xs gap-1.5 font-bold ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {micOn ? <Mic size={15} /> : <MicOff size={15} />}
            {micOn ? 'Mic On' : 'Muted'}
          </Button>

          <Button
            size="sm"
            onClick={toggleCam}
            className={`h-9 px-3 text-xs gap-1.5 font-bold ${camOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {camOn ? <Video size={15} /> : <VideoOff size={15} />}
            {camOn ? 'Cam On' : 'Cam Off'}
          </Button>

          <Button
            size="sm"
            onClick={handleEndClass}
            className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            <PhoneOff size={15} /> End Class
          </Button>
        </div>
      </div>

      {/* Main Grid: Whiteboard + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left 3 Cols: Interactive Whiteboard */}
        <div className="lg:col-span-3 space-y-4">
          <Whiteboard isTeacher={true} className="min-h-[560px]" />
        </div>

        {/* Right 1 Col: Classroom Side Panels */}
        <div className="space-y-4">
          {/* Teacher Live Webcam (real camera + mic via getUserMedia) */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative border border-slate-800 shadow-sm">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`w-full h-full object-cover ${camOn && hasStream ? '' : 'invisible'}`}
            />
            {hasStream && !camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#667085] text-xs gap-1 bg-slate-900">
                <VideoOff size={20} />
                <span>Camera is Off</span>
              </div>
            )}
            {!hasStream && requesting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-xs gap-2">
                <Sparkles size={20} className="animate-pulse" />
                <span>Starting camera &amp; microphone…</span>
              </div>
            )}
            {!hasStream && !requesting && mediaError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-2">
                <VideoOff size={20} className="text-red-400" />
                <span className="text-[11px] text-red-300 leading-snug">{mediaError}</span>
                <Button size="sm" onClick={start} className="h-7 text-[10px] px-3 mt-1">Try Again</Button>
              </div>
            )}
            {!hasStream && !requesting && !mediaError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#667085] text-xs gap-1">
                <VideoOff size={20} />
                <span>Camera is off</span>
              </div>
            )}
            <div className="absolute top-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-mono flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${micOn && hasStream ? 'bg-emerald-400' : 'bg-red-500'}`} />
              {micOn && hasStream ? 'Mic live' : 'Muted'}
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-mono">
              {teacherName} • {hasStream ? 'Live' : 'Offline'}
            </div>
          </div>

          {/* Interactive Classroom Tabs (Participants / Hands / Chat) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col min-h-[480px]">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-3 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'participants' ? 'bg-white text-[#006B5D] border-b-2 border-[#006B5D]' : 'text-[#667085]'
                }`}
              >
                <Users size={14} /> Children ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('hands')}
                className={`py-3 flex items-center justify-center gap-1.5 relative transition-all ${
                  activeTab === 'hands' ? 'bg-white text-[#006B5D] border-b-2 border-[#006B5D]' : 'text-[#667085]'
                }`}
              >
                <Hand size={14} /> Hands
                {raisedHands.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {raisedHands.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'chat' ? 'bg-white text-[#006B5D] border-b-2 border-[#006B5D]' : 'text-[#667085]'
                }`}
              >
                <MessageSquare size={14} /> Chat
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'participants' && (
                <div className="space-y-3">
                  {participants.length === 0 ? (
                    <p className="text-sm text-[#667085] py-10 text-center">No students enrolled in this class yet.</p>
                  ) : (
                    participants.slice(0, 8).map(stu => (
                      <div key={stu.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E6F4F1] text-[#006B5D] flex items-center justify-center font-bold text-xs">
                            {stu.name[0]}
                          </div>
                          <span className="font-semibold text-[#344054]">{stu.name}</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">Enrolled</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'hands' && (
                <div className="space-y-3">
                  {raisedHands.length === 0 ? (
                    <p className="text-sm text-[#667085] py-10 text-center">No hands currently raised.</p>
                  ) : (
                    raisedHands.map(h => (
                      <div key={h.studentId} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#101828] flex items-center gap-1.5 text-sm">
                            <Hand size={14} className="text-amber-600" /> {h.name}
                          </p>
                          <span className="text-[11px] text-[#667085] mt-0.5 block">{h.time}</span>
                        </div>
                        <Button size="sm" onClick={() => dismissHand(h.studentId)} className="h-8 px-3">
                          Unmute
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-sm text-[#667085] py-10 text-center">No messages yet — say hello to the class.</p>
                    ) : (
                      chatMessages.map((m, i) => (
                        <div key={i} className={`p-3 rounded-2xl text-sm ${m.isTeacher ? 'bg-[#E6F4F1] text-[#006B5D] border border-[#B7DDD6]' : 'bg-slate-50 text-[#344054]'}`}>
                          <span className="font-bold text-xs block mb-1">{m.sender}</span>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMsg} className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder="Type a message to class..."
                      className="flex-1 text-sm border border-slate-200 bg-slate-50 rounded-xl px-4 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-[#006B5D] transition-all"
                    />
                    <Button type="submit" className="h-11 w-11 rounded-xl p-0 flex items-center justify-center bg-[#006B5D] text-white">
                      <Send size={16} />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
