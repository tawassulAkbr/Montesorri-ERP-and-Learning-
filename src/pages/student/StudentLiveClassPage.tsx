import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hand, MessageSquare, Sparkles, Heart, Smile,
  Send, Users, Video, Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Whiteboard } from '@/components/shared/Whiteboard';
import { useData } from '@/context/DataContext';

interface ReactionParticle {
  id: number;
  emoji: string;
  x: number;
}

export const StudentLiveClassPage: React.FC = () => {
  const { liveClass } = useData();
  const [handRaised, setHandRaised] = useState(false);
  const [reactions, setReactions] = useState<ReactionParticle[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isMe?: boolean }[]>([
    { sender: 'Maria Montessori', text: 'Welcome to phonics circle, Ali! Let\'s practice sounds together.' },
    { sender: 'Zara Ahmed', text: 'Hi Ali! 🌟' },
  ]);
  const [newMsg, setNewMsg] = useState('');

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
    setChatMessages(prev => [...prev, { sender: 'Ali Hassan', text: newMsg, isMe: true }]);
    setNewMsg('');
  };

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
        <div className="flex items-center gap-2">
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
          {/* Teacher Stream */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-sm">
            <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-white">
              <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xl mb-1 shadow-md">
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
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-indigo-600" /> Classroom Chat
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {chatMessages.map((m, i) => (
                <div key={i} className={`p-2 rounded-xl text-xs ${m.isMe ? 'bg-indigo-600 text-white ml-4' : 'bg-slate-50 text-slate-700 mr-4'}`}>
                  <span className={`text-[10px] font-bold block ${m.isMe ? 'text-indigo-100' : 'text-slate-500'}`}>{m.sender}:</span>
                  <p className="mt-0.5">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-2.5 bg-slate-50 border-t border-slate-100 flex gap-1.5">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Say something to teacher..."
                className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
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
