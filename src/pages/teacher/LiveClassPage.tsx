import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Users, Hand, MessageSquare,
  Sparkles, ScreenShare, PhoneOff, Settings, Volume2, Award, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Whiteboard } from '@/components/shared/Whiteboard';
import { useData } from '@/context/DataContext';
import { students } from '@/data/mockData';

interface StudentHand {
  studentId: string;
  name: string;
  time: string;
}

export const TeacherLiveClassPage: React.FC = () => {
  const { liveClass, endLiveClass } = useData();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'participants' | 'hands' | 'chat'>('participants');
  const [raisedHands, setRaisedHands] = useState<StudentHand[]>([
    { studentId: 's1', name: 'Ali Hassan', time: '1 min ago' },
    { studentId: 's2', name: 'Zara Ahmed', time: 'Just now' },
  ]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isTeacher?: boolean }[]>([
    { sender: 'Maria Montessori', text: 'Good morning little explorers! Today we are learning letter sounds /s/ and /a/.', isTeacher: true },
    { sender: 'Zara Ahmed', text: 'Good morning teacher! 👋' },
    { sender: 'Ali Hassan', text: 'I brought my apple picture! 🍎' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg) return;
    setChatMessages(prev => [...prev, { sender: 'Maria Montessori', text: newMsg, isTeacher: true }]);
    setNewMsg('');
  };

  const dismissHand = (id: string) => {
    setRaisedHands(prev => prev.filter(h => h.studentId !== id));
  };

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
            onClick={() => setMicOn(!micOn)}
            className={`h-9 px-3 text-xs gap-1.5 font-bold ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {micOn ? <Mic size={15} /> : <MicOff size={15} />}
            {micOn ? 'Mic On' : 'Muted'}
          </Button>

          <Button
            size="sm"
            onClick={() => setCamOn(!camOn)}
            className={`h-9 px-3 text-xs gap-1.5 font-bold ${camOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {camOn ? <Video size={15} /> : <VideoOff size={15} />}
            {camOn ? 'Cam On' : 'Cam Off'}
          </Button>

          <Button
            size="sm"
            onClick={endLiveClass}
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
          {/* Teacher Webcam Simulation */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-sm">
            {camOn ? (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-900 to-purple-900 flex flex-col items-center justify-center text-white">
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xl mb-1 shadow-md">
                  MM
                </div>
                <span className="text-xs font-bold">Maria Montessori (Teacher)</span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">● Camera Active</span>
              </div>
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-1">
                <VideoOff size={20} />
                <span>Camera is Off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-mono">
              720p HD • 30fps
            </div>
          </div>

          {/* Interactive Classroom Tabs (Participants / Hands / Chat) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[380px]">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-2.5 flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'participants' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'
                }`}
              >
                <Users size={13} /> Toddlers (8)
              </button>
              <button
                onClick={() => setActiveTab('hands')}
                className={`py-2.5 flex items-center justify-center gap-1 relative transition-all ${
                  activeTab === 'hands' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'
                }`}
              >
                <Hand size={13} /> Hands
                {raisedHands.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {raisedHands.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2.5 flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'
                }`}
              >
                <MessageSquare size={13} /> Chat
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'participants' && (
                <div className="space-y-2">
                  {students.slice(0, 6).map((stu, i) => (
                    <div key={stu.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {stu.name[0]}
                        </div>
                        <span className="font-semibold text-slate-700">{stu.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Connected</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hands' && (
                <div className="space-y-2">
                  {raisedHands.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No hands currently raised.</p>
                  ) : (
                    raisedHands.map(h => (
                      <div key={h.studentId} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <Hand size={13} className="text-amber-600" /> {h.name}
                          </p>
                          <span className="text-[10px] text-slate-400">{h.time}</span>
                        </div>
                        <Button size="sm" onClick={() => dismissHand(h.studentId)} className="h-6 text-[10px] px-2">
                          Unmute
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`p-2 rounded-xl text-xs ${m.isTeacher ? 'bg-indigo-50 text-indigo-900 border border-indigo-100' : 'bg-slate-50 text-slate-700'}`}>
                        <span className="font-bold text-[11px] block">{m.sender}:</span>
                        <p className="mt-0.5">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMsg} className="flex gap-1.5 pt-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder="Type a message to class..."
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button type="submit" size="sm" className="h-8 px-2.5">
                      <Send size={13} />
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
