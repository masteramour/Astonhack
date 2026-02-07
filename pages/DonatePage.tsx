
import React, { useState } from 'react';
import { OctopusLogo } from '../constants';

const DonatePage: React.FC = () => {
  const [donationType, setDonationType] = useState<'time' | 'item'>('item');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black">Lend a Tentacle</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Whether it's your time or items, your contribution helps the 8vents community grow stronger and kinder.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button 
          onClick={() => setDonationType('item')}
          className={`p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${
            donationType === 'item' 
              ? 'border-brand bg-brand/5 shadow-xl scale-105' 
              : 'border-white dark:border-slate-800 bg-white dark:bg-slate-800 opacity-70 grayscale'
          }`}
        >
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-brand">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Donate Items</h3>
            <p className="text-xs text-slate-500 mt-1">Food, clothes, toys, or supplies</p>
          </div>
        </button>

        <button 
          onClick={() => setDonationType('time')}
          className={`p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${
            donationType === 'time' 
              ? 'border-brand bg-brand/5 shadow-xl scale-105' 
              : 'border-white dark:border-slate-800 bg-white dark:bg-slate-800 opacity-70 grayscale'
          }`}
        >
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-brand">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">Donate Time</h3>
            <p className="text-xs text-slate-500 mt-1">Volunteer for tasks and events</p>
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black">Thank You!</h2>
            <p className="text-slate-500 mt-2">Your contribution has been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Full Name</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-brand" placeholder="John Octopus" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">Email Address</label>
                <input type="email" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-brand" placeholder="john@ink.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500">
                {donationType === 'item' ? 'Item Category' : 'Service/Skill'}
              </label>
              <select className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-brand">
                {donationType === 'item' ? (
                  <>
                    <option>Food & Groceries</option>
                    <option>Clothes & Apparel</option>
                    <option>Toys & Games</option>
                    <option>School Supplies</option>
                    <option>Other Items</option>
                  </>
                ) : (
                  <>
                    <option>Administrative Work</option>
                    <option>Manual Labor</option>
                    <option>Teaching/Education</option>
                    <option>Tech Support</option>
                    <option>Event Setup</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500">
                {donationType === 'item' ? 'Description of items' : 'Hours Available'}
              </label>
              <textarea 
                className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-brand h-32"
                placeholder={donationType === 'item' ? "Tell us about the items you're giving..." : "How many hours can you commit to this task?"}
                required
              ></textarea>
            </div>

            <button className="w-full py-5 bg-brand text-white text-xl font-black rounded-3xl shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all transform hover:scale-[1.02] active:scale-95">
              Confirm Donation
            </button>
          </form>
        )}
        
        {/* Background Accent */}
        <div className="absolute -bottom-10 -right-10 opacity-5">
          <OctopusLogo className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
