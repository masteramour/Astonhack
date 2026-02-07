
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OctopusLogo, MOCK_USERS } from '../constants';
import { UserProfile, UserRole } from '../types';

interface SignupPageProps {
  onSignup: (user: UserProfile) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.VOLUNTEER);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.0060 });
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Request user's current location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError('Could not retrieve location. Using default location.');
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a user object with their current location
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: 'New Human',
      role: role,
      email: 'new@8vents.com',
      avatar: 'https://picsum.photos/seed/new/200',
      location: location,
      skills: ['Newbie'],
      eventsHelped: 0,
      totalDonatedTime: 0,
      totalDonatedItems: 0,
      bio: 'Just joined the 8vents community!'
    };
    onSignup(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-2xl border border-brand/5 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 opacity-5">
          <OctopusLogo className="w-64 h-64" />
        </div>

        <div className="text-center relative z-10">
          <OctopusLogo className="mx-auto h-16 w-16 text-brand" />
          <h2 className="mt-6 text-4xl font-black tracking-tighter">Start Making Waves</h2>
          <p className="mt-2 text-sm text-slate-500">Choose your role and join our global community.</p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={handleSignup}>
          {/* Location Status */}
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            locationError 
              ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}>
            {locationLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Detecting your location...</span>
              </>
            ) : locationError ? (
              <>
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-14a9 9 0 100 18 9 9 0 000-18z" /></svg>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-200">{locationError}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m11-5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-bold text-green-700 dark:text-green-200">Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setRole(UserRole.VOLUNTEER)}
              className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-3 ${
                role === UserRole.VOLUNTEER ? 'border-brand bg-brand/5 shadow-lg' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === UserRole.VOLUNTEER ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <span className="font-black uppercase tracking-widest text-xs">Volunteer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole(UserRole.MANAGER)}
              className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-3 ${
                role === UserRole.MANAGER ? 'border-brand bg-brand/5 shadow-lg' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === UserRole.MANAGER ? 'bg-brand text-white' : 'bg-slate-200 text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="font-black uppercase tracking-widest text-xs">Event Manager</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="block w-full px-5 py-4 border-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                placeholder="Bubbles McGee"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
              <input
                type="email"
                required
                className="block w-full px-5 py-4 border-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                placeholder="bubbles@sea.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="block w-full px-5 py-4 border-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-brand focus:ring-brand border-slate-300 rounded-lg" />
            <label htmlFor="terms" className="ml-2 block text-xs font-bold text-slate-500">
              I agree to the <a href="#" className="text-brand hover:underline">Community Guidelines</a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-5 px-4 text-lg font-black rounded-3xl text-white bg-brand hover:bg-brand-dark shadow-2xl shadow-brand/30 transition-all active:scale-95"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-bold">
            Already have an account? <Link to="/login" className="text-brand hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
