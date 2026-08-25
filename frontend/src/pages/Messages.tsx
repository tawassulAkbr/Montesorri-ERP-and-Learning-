import React, { useState } from 'react';
import { Send, Search, Plus } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

const conversations: Conversation[] = [
  { id: '1', name: 'Laura Thompson', role: 'Parent', lastMessage: "Thank you for the update about Emma!", time: '2:30 PM', unread: 0, avatar: '👩' },
  { id: '2', name: 'Sarah Johnson', role: 'Lead Teacher', lastMessage: 'Can we discuss the new lesson plan?', time: '1:15 PM', unread: 2, avatar: '👩‍🏫' },
  { id: '3', name: 'Raj Patel', role: 'Parent', lastMessage: "Sophia won't be coming tomorrow", time: '11:00 AM', unread: 1, avatar: '👨' },
  { id: '4', name: 'Michael Chen', role: 'Teacher', lastMessage: 'I submitted the observation forms', time: 'Yesterday', unread: 0, avatar: '👨‍🏫' },
  { id: '5', name: 'School Announcements', role: 'Channel', lastMessage: 'Reminder: Parent-Teacher conference next week', time: 'Yesterday', unread: 0, avatar: '📢' },
];

const messageData: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'You', senderRole: '', text: "Hi Laura, I wanted to share that Emma did really well with the Pink Tower exercise today!", time: '2:15 PM', isMe: true },
    { id: 'm2', sender: 'Laura Thompson', senderRole: 'Parent', text: "That's wonderful to hear! She's been talking about it at home too.", time: '2:20 PM', isMe: false },
    { id: 'm3', sender: 'You', senderRole: '', text: "She's showing great focus and precision. I'll be moving her to the Brown Stair next week.", time: '2:25 PM', isMe: true },
    { id: 'm4', sender: 'Laura Thompson', senderRole: 'Parent', text: "Thank you for the update about Emma!", time: '2:30 PM', isMe: false },
  ],
  '2': [
    { id: 'm1', sender: 'Sarah Johnson', senderRole: 'Lead Teacher', text: "Hi, do you have a moment to discuss the new lesson plan for the Sensorial area?", time: '1:00 PM', isMe: false },
    { id: 'm2', sender: 'Sarah Johnson', senderRole: 'Lead Teacher', text: "I was thinking we could introduce the Color Tablets Box 2 next week.", time: '1:15 PM', isMe: false },
  ],
  '3': [
    { id: 'm1', sender: 'Raj Patel', senderRole: 'Parent', text: "Good morning. Sophia won't be coming tomorrow as she has a doctor's appointment.", time: '11:00 AM', isMe: false },
  ],
};

export default function Messages() {
  const [selectedConvo, setSelectedConvo] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState(messageData);

  const filteredConvos = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const currentMessages = messages[selectedConvo] || [];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      sender: 'You',
      senderRole: '',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages(prev => ({
      ...prev,
      [selectedConvo]: [...(prev[selectedConvo] || []), msg],
    }));
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-surface-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-surface-200 flex flex-col">
        <div className="p-4 border-b border-surface-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredConvos.map(convo => (
            <div key={convo.id} onClick={() => setSelectedConvo(convo.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-surface-50 ${selectedConvo === convo.id ? 'bg-brand-50' : 'hover:bg-surface-50'}`}>
              <div className="text-2xl">{convo.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-surface-900 text-sm truncate">{convo.name}</p>
                  <span className="text-xs text-surface-400 whitespace-nowrap ml-2">{convo.time}</span>
                </div>
                <p className="text-xs text-surface-500 truncate">{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">{convo.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center gap-3">
          <div className="text-2xl">{conversations.find(c => c.id === selectedConvo)?.avatar}</div>
          <div>
            <p className="font-bold text-surface-900">{conversations.find(c => c.id === selectedConvo)?.name}</p>
            <p className="text-xs text-surface-500">{conversations.find(c => c.id === selectedConvo)?.role}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${msg.isMe ? 'bg-brand-500 text-white rounded-br-md' : 'bg-surface-100 text-surface-800 rounded-bl-md'}`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isMe ? 'text-brand-200' : 'text-surface-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-surface-200">
          <div className="flex gap-3">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
            <button onClick={sendMessage} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-3 rounded-xl transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
