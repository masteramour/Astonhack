
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OctopusLogo, MOCK_USERS } from '../constants';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lookup user by email from mock list + persisted users
    try {
      const persisted = JSON.parse(localStorage.getItem('users') || '[]');
      const allUsers = [...MOCK_USERS, ...persisted];
      const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) {
        alert('No user found with that email. Try signing up first.');
        return;
      }
      onLogin(user);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-2xl border border-brand/5 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -top-10 -right-10 opacity-5">
          <OctopusLogo className="w-48 h-48" />
        </div>

        <div className="text-center relative z-10">
          <OctopusLogo className="mx-auto h-16 w-16 text-brand" />
          <h2 className="mt-6 text-4xl font-black tracking-tighter">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Dive back into the community.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                placeholder="inky@8vents.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-5 py-4 border-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand focus:ring-brand border-slate-300 rounded-lg" />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-slate-500">Stay attached</label>
            </div>
            <div className="text-xs">
              <a href="#" className="font-bold text-brand hover:underline">Forgot password?</a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-lg font-black rounded-2xl text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand shadow-xl shadow-brand/20 transition-all active:scale-95"
            >
              Log in
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 font-bold">
            New to 8vents? <Link to="/signup" className="text-brand hover:underline">Join the swarm</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
