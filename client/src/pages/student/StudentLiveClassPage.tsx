import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hand, MessageSquare, Sparkles, Send, Video, VideoOff, Mic, MicOff,
  Radio, Clock, Calendar, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Whiteboard } from '@/components/shared/Whiteboard';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { useUserMedia } from '@/hooks/useUserMedia';

interface ReactionParticle {
  id: number;
  emoji: string;
  x: number;
}

export const StudentLiveClassPage: React.FC = () => {
  const { liveClass, schedules, students } = useData();
  const { currentUser } = useAuth();
  const studentName = currentUser?.name || 'Student';
  const me = students.find(s => s.id === currentUser?.id);
  const { videoRef, hasStream, micOn, camOn, error: mediaError, requesting, start, toggleMic, toggleCam } = useUserMedia();
  const [handRaised, setHandRaised] = useState(false);
  const [reactions, setReactions] = useState<ReactionParticle[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isMe?: boolean }[]>([]);
  const [newMsg, setNewMsg] = useState('');

  // Only request the camera/microphone when the teacher has actually started
  // a class. Before that, the page sits in a friendly waiting state so the
  // browser doesn't pop the permission dialog every time a student lands here.
  useEffect(() => {
    if (liveClass.isActive) start();
  }, [liveClass.isActive, start]);

  const triggerReaction = (emoji: string) => {
    const newReaction: ReactionParticle = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10,
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2500);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg) return;
    setChatMessages(prev => [...prev, { sender: studentName, text: newMsg, isMe: true }]);
    setNewMsg('');
  };

  // Upcoming scheduled live-style items for the student's class.
  const upcoming = schedules
    .filter(s => !me || !s.class || s.class === me.class)
    .slice(0, 3);

  // ─── No live class — friendly waiting screen ───────────────────────────────
  if (!liveClass.isActive) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">Live Classroom</h1>
            <p className="text-sm text-[#667085]">Your live lessons will appear here once your teacher starts broadcasting.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            No live class right now
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(#006B5D 2px, transparent 2px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 items-center gap-6 p-7 sm:p-10">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#006B5D] font-extrabold">
                <Radio size={12} /> Waiting Room
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828] leading-tight">
                Your teacher hasn't started a live class yet
              </h2>
              <p className="mt-2 text-sm text-[#667085] max-w-md leading-relaxed">
                When your teacher goes live, you'll see a red <b>Join Live Class</b> banner on your dashboard and you can join right from this page. Your camera and microphone stay off until then.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-[#B7DDD6] bg-[#E6F4F1] text-[#006B5D] gap-1.5">
                  <Sparkles size={12} /> Phonics circle times
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-500 gap-1.5">
                  <Clock size={12} /> Daily routine practice
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-500 gap-1.5">
                  <Calendar size={12} /> Activity introductions
                </Badge>
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-center">
              <div className="relative">
                <div className="h-44 w-44 rounded-full bg-[#E6F4F1] flex items-center justify-center text-[#006B5D] shadow-[0_18px_35px_rgba(0,107,93,0.15)]">
                  <Radio size={72} strokeWidth={1.5} />
                </div>
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[#006B5D]/30"
                  animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[#006B5D]/20"
                  animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-[#006B5D]" />
              <h3 className="text-sm font-extrabold text-[#101828]">What's coming up</h3>
            </div>
            <ul className="space-y-2">
              {upcoming.map(s => (
                <li key={s.id} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-white flex items-center justify-center text-[#006B5D] border border-slate-200">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#101828] truncate">{s.title}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {s.startTime}–{s.endTime}
                      {s.class ? ` · ${s.class}` : ''}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 mt-1.5" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ─── Class is in session — show the live classroom UI ──────────────────────
  return (
    <div className="space-y-4 relative overflow-hidden">
      {/* Floating Reactions Canvas */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: 400, x: `${r.x}%`, scale: 0.8 }}
              animate={{ opacity: 0, y: 50, scale: 1.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute text-4xl"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Classroom Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                🔴 LIVE LESSON
              </span>
              <span className="text-xs text-slate-300">{liveClass.class}</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">{liveClass.topic}</h2>
          </div>
        </div>

        {/* Student Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={toggleMic}
            className={`font-bold text-xs gap-1.5 ${micOn && hasStream ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {micOn && hasStream ? <Mic size={15} /> : <MicOff size={15} />}
            {micOn && hasStream ? 'Mic On' : 'Muted'}
          </Button>
          <Button
            size="sm"
            onClick={toggleCam}
            className={`font-bold text-xs gap-1.5 ${camOn && hasStream ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {camOn && hasStream ? <Video size={15} /> : <VideoOff size={15} />}
            {camOn && hasStream ? 'Cam On' : 'Cam Off'}
          </Button>
          <Button
            size="sm"
            onClick={() => setHandRaised(!handRaised)}
            className={`font-bold text-xs gap-1.5 shadow-sm transition-all ${
              handRaised
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <Hand size={15} />
            {handRaised ? 'Hand Raised 🙋‍♂️' : 'Raise Hand'}
          </Button>

          {/* Quick Reaction Emojis */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {['👏', '⭐', '❤️', '🎉', '🍎'].map(em => (
              <button
                key={em}
                onClick={() => triggerReaction(em)}
                className="w-8 h-8 rounded-lg hover:bg-slate-700 text-base transition-transform hover:scale-125 flex items-center justify-center cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Whiteboard + Teacher Video & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Whiteboard isTeacher={false} className="min-h-[560px]" />
        </div>

        <div className="space-y-4">
          {/* Student Self-View (real camera + mic via getUserMedia) */}
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
                <span>Your camera is off</span>
              </div>
            )}
            {!hasStream && requesting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 text-xs gap-2">
                <Sparkles size={20} className="animate-pulse" />
                <span>Starting your camera…</span>
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
            <div className="absolute top-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-mono">
              You {hasStream ? '• Live' : ''}
            </div>
          </div>

          {/* Teacher Stream */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-sm">
            <div className="w-full h-full bg-gradient-to-tr from-[#006B5D] to-[#007A6B] flex flex-col items-center justify-center text-white">
              <div className="w-14 h-14 rounded-full bg-[#E6F4F1] flex items-center justify-center font-bold text-xl mb-1 shadow-md text-[#006B5D]">
                MM
              </div>
              <span className="text-xs font-bold">{liveClass.teacherName} (Teacher)</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">● Speaking</span>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
              <Mic size={10} className="text-emerald-400" /> Live
            </div>
          </div>

          {/* Classroom Chat */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[380px]">
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-[#344054] flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#006B5D]" /> Classroom Chat
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-[11px] text-[#667085] text-center py-6">Say hi to your teacher!</p>
              ) : (
                chatMessages.map((m, i) => (
                  <div key={i} className={`p-2 rounded-xl text-xs ${m.isMe ? 'bg-[#006B5D] text-white ml-4' : 'bg-slate-50 text-[#344054] mr-4'}`}>
                    <span className={`text-[10px] font-bold block ${m.isMe ? 'text-emerald-200' : 'text-[#667085]'}`}>{m.sender}:</span>
                    <p className="mt-0.5">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="p-2.5 bg-slate-50 border-t border-slate-100 flex gap-1.5">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Say something to teacher..."
                className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#006B5D]"
              />
              <Button type="submit" size="sm" className="h-8 px-2.5">
                <Send size={13} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
