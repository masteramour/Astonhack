
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_USERS } from '../constants';
import { UserRole } from '../types';

const VolunteersPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');

  const filteredUsers = roleFilter === 'All' 
    ? MOCK_USERS 
    : MOCK_USERS.filter(u => u.role === roleFilter);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black">Our Community</h1>
          <p className="text-slate-500 mt-2">Discover the people making things happen.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          {['All', UserRole.MANAGER, UserRole.VOLUNTEER].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                roleFilter === role 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-slate-500 hover:text-brand'
              }`}
            >
              {role}s
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredUsers.map(user => (
          <Link 
            key={user.id} 
            to={`/volunteers/${user.id}`}
            className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 text-center shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:border-brand/20 transition-all"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <img src={user.avatar} className="w-full h-full rounded-[1.5rem] object-cover border-4 border-brand/10 transition-transform group-hover:scale-110" alt={user.name} />
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg ${
                user.role === UserRole.VOLUNTEER ? 'bg-orange-500' : 'bg-slate-800'
              }`}>
                {user.role === UserRole.VOLUNTEER ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1">{user.name}</h3>
            <p className="text-brand text-xs font-black uppercase tracking-widest mb-4">{user.role}</p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
              {user.skills.slice(0, 2).map(skill => (
                <span key={skill} className="bg-slate-50 dark:bg-slate-700/50 text-slate-400 text-[10px] px-2 py-1 rounded-lg font-bold">
                  {skill}
                </span>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${user.email}`} className="text-brand hover:underline truncate font-bold">{user.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:${user.phone}`} className="text-brand hover:underline font-bold">{user.phone}</a>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center px-2">
              <div className="text-center">
                <div className="text-sm font-black">{user.eventsHelped}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Events</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-black">{user.totalDonatedTime}h</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Time</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-black">{user.totalDonatedItems}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase">Items</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VolunteersPage;
