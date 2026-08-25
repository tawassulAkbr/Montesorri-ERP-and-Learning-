import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-800">
      <header className="px-8 py-6 flex justify-between items-center border-b border-surface-100 bg-white shadow-sm">
        <div className="text-2xl font-bold text-brand-600 tracking-tight">KinderGuide.</div>
        <nav className="space-x-6">
          <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
          <button className="text-brand-600 font-medium hover:text-brand-700 transition-colors">Login</button>
          <button className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-md hover:shadow-lg">Request Demo</button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="px-8 py-24 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-surface-900 mb-8 leading-tight">
            The Modern <span className="text-brand-500">Montessori</span> ERP & LMS
          </h1>
          <p className="text-xl text-surface-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Unify curriculum planning, student progress, attendance, and parent communication in one beautiful, offline-first platform.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Start Your Free Trial
            </button>
            <button className="bg-white hover:bg-surface-100 text-surface-800 border border-surface-200 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm hover:shadow-md">
              View Portals
            </button>
          </div>
        </section>

        <section id="features" className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-16 text-surface-900">Designed for Every Role</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {['Teachers', 'Parents', 'Admins'].map((role) => (
                <div key={role} className="p-8 rounded-2xl bg-surface-50 border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-6 text-xl font-bold">
                    {role[0]}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{role}</h3>
                  <p className="text-surface-600">
                    {role === 'Teachers' && 'Observation logging, smart attendance, and Montessori lesson planning.'}
                    {role === 'Parents' && 'Real-time progress, fee payments, and AI-generated weekly digests.'}
                    {role === 'Admins' && 'HR, inventory, multi-tenant billing, and comprehensive dashboards.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-900 text-surface-400 py-12 text-center">
        <p>&copy; {new Date().getFullYear()} KinderGuide. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
