import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BarChart3, Shield, Wifi, WifiOff, Brain, ClipboardList } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Montessori Curriculum',
    desc: 'Plan lessons aligned with Montessori philosophy. Track mastery across Practical Life, Sensorial, Language, Math, and Culture.',
    color: 'bg-brand-100 text-brand-600',
  },
  {
    icon: ClipboardList,
    title: 'Smart Attendance',
    desc: 'Mark attendance with a single tap. Works offline and syncs automatically when back online.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Parent Portal',
    desc: 'Parents stay connected with real-time progress updates, milestone tracking, and weekly AI-generated digests.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    desc: 'Visual dashboards with attendance trends, learning progress charts, and actionable AI-powered recommendations.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    desc: 'Get intelligent recommendations for lesson planning, student grouping, and personalized learning paths.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant & Secure',
    desc: 'Each school gets its own isolated workspace. Role-based access ensures data privacy and security.',
    color: 'bg-red-100 text-red-600',
  },
];

const roles = [
  {
    title: 'School Administrators',
    desc: 'Full control over HR, student enrollment, fee management, inventory, and school-wide analytics. Configure your school workspace and manage all staff.',
    emoji: '🏫',
  },
  {
    title: 'Teachers',
    desc: 'Log observations, plan Montessori lessons, take attendance, and communicate with parents. Track each student\'s journey through the curriculum.',
    emoji: '👩‍🏫',
  },
  {
    title: 'Parents',
    desc: 'Stay connected with your child\'s progress through weekly AI digests, milestone notifications, fee payments, and direct messaging with teachers.',
    emoji: '👨‍👩‍👧',
  },
  {
    title: 'Students',
    desc: 'Age-appropriate micro-learning activities, gamified progress tracking, and a personalized dashboard that celebrates achievements.',
    emoji: '🧒',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-surface-800">
      {/* Navigation */}
      <header className="px-8 py-5 flex justify-between items-center border-b border-surface-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="text-2xl font-bold text-brand-600 tracking-tight">🌱 KinderGuide</div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-surface-600 hover:text-brand-600 transition-colors text-sm font-medium">Features</a>
          <a href="#portals" className="text-surface-600 hover:text-brand-600 transition-colors text-sm font-medium">Portals</a>
          <a href="#about" className="text-surface-600 hover:text-brand-600 transition-colors text-sm font-medium">About</a>
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors text-sm">Login</Link>
          <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg text-sm">Get Started</Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-blue-50"></div>
          <div className="relative px-8 py-24 md:py-32 text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              <WifiOff className="w-4 h-4" /> Offline-First • Built for Montessori Schools
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-surface-900 mb-8 leading-[1.1]">
              The Complete <br />
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">Montessori School</span>
              <br />Management System
            </h1>
            <p className="text-lg md:text-xl text-surface-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Unify curriculum planning, student observations, attendance tracking, and parent communication 
              in one beautiful platform designed specifically for Montessori education.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Setup Your School →
              </Link>
              <Link to="/login" className="bg-white hover:bg-surface-50 text-surface-800 border border-surface-200 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm hover:shadow-md">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-surface-50">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">Everything Your School Needs</h2>
              <p className="text-surface-600 text-lg max-w-2xl mx-auto">Purpose-built tools for Montessori education, from lesson planning to parent engagement.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="bg-white p-8 rounded-2xl border border-surface-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-surface-900">{f.title}</h3>
                    <p className="text-surface-600 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">A Portal for Every Role</h2>
              <p className="text-surface-600 text-lg max-w-2xl mx-auto">Each user gets a tailored experience designed for their specific needs.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {roles.map((role) => (
                <div key={role.title} className="bg-surface-50 p-8 rounded-2xl border border-surface-100 hover:border-brand-200 transition-all duration-300">
                  <div className="text-4xl mb-4">{role.emoji}</div>
                  <h3 className="text-xl font-bold mb-3 text-surface-900">{role.title}</h3>
                  <p className="text-surface-600 leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About / CTA Section */}
        <section id="about" className="py-24 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your School?</h2>
            <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join schools already using KinderGuide to streamline operations, engage parents, 
              and focus on what matters most — the children.
            </p>
            <Link to="/register" className="inline-block bg-white text-brand-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl">
              Get Started for Free →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-white">🌱 KinderGuide</div>
          <p className="text-sm">&copy; {new Date().getFullYear()} KinderGuide. Built for Montessori Schools.</p>
        </div>
      </footer>
    </div>
  );
}
