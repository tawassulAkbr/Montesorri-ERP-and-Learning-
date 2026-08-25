import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user, data.token);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : JSON.stringify(err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-surface-100">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-brand-600 tracking-tight block mb-2">KinderGuide.</Link>
          <h2 className="text-xl text-surface-600 font-medium">Start your free trial</h2>
          <p className="text-surface-500 text-sm mt-2">Setup your school's workspace in seconds.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">School Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Montessori Academy"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="admin@school.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-surface-900 hover:bg-black text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg mt-4"
          >
            Create Workspace
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center text-surface-500 text-sm">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
