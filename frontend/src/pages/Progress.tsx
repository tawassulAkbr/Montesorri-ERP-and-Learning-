import React from 'react';
import { Star, TrendingUp, Award, BookOpen, Clock } from 'lucide-react';

const milestones = [
  { id: '1', title: 'Mastered: Sandpaper Letters', area: 'Language', date: 'August 24, 2026', icon: '📝', color: 'bg-blue-100 text-blue-700' },
  { id: '2', title: 'Completed: Pink Tower', area: 'Sensorial', date: 'August 20, 2026', icon: '🏗️', color: 'bg-pink-100 text-pink-700' },
  { id: '3', title: 'Started: Spindle Boxes', area: 'Mathematics', date: 'August 15, 2026', icon: '🔢', color: 'bg-purple-100 text-purple-700' },
  { id: '4', title: 'Mastered: Pouring Water', area: 'Practical Life', date: 'August 10, 2026', icon: '🚰', color: 'bg-green-100 text-green-700' },
];

export default function Progress() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Progress Tracker</h1>
          <p className="text-surface-500 text-sm mt-1">View learning milestones and achievements</p>
        </div>
      </div>

      {/* AI Digest Card */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Star className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">✨ AI Weekly Digest</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Great Focus in Sensorial</h2>
          <p className="opacity-90 max-w-2xl leading-relaxed">
            Emma has shown exceptional concentration this week in the Sensorial area. She successfully completed the Pink Tower extensions and has been eager to help younger students. Her fine motor skills are developing beautifully, particularly noted during the pouring exercises.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-3"><Award className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-surface-900">12</p>
          <p className="text-sm text-surface-500">Milestones Mastered</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3"><BookOpen className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-surface-900">5</p>
          <p className="text-sm text-surface-500">Active Areas</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3"><TrendingUp className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-surface-900">18</p>
          <p className="text-sm text-surface-500">Activities Completed</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-surface-200">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3"><Clock className="w-5 h-5" /></div>
          <p className="text-2xl font-bold text-surface-900">98%</p>
          <p className="text-sm text-surface-500">Attendance Rate</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 className="text-lg font-bold text-surface-900 mb-6">Recent Milestones</h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-200 before:to-transparent">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Icon */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${milestone.color} z-10`}>
                <span className="text-lg">{milestone.icon}</span>
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-surface-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-surface-900">{milestone.title}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${milestone.color}`}>{milestone.area}</span>
                </div>
                <time className="text-sm text-surface-500">{milestone.date}</time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
