
import React from 'react';
import { MOCK_USERS } from '../constants';

const LeaderboardPage: React.FC = () => {
  // Simple scoring: 10 points per event, 5 points per hour, 2 points per item
  const sortedVolunteers = [...MOCK_USERS].sort((a, b) => {
    const scoreA = (a.eventsHelped * 10) + (a.totalDonatedTime * 5) + (a.totalDonatedItems * 2);
    const scoreB = (b.eventsHelped * 10) + (b.totalDonatedTime * 5) + (b.totalDonatedItems * 2);
    return scoreB - scoreA;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black">Top Contributors</h1>
        <p className="text-slate-500">Celebrating the amazing humans who power our community.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedVolunteers.map((user, index) => (
          <div 
            key={user.id} 
            className={`flex items-center p-6 rounded-[2rem] bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] ${
              index === 0 ? 'border-brand border-2 bg-brand/5' : ''
            }`}
          >
            <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl ${
              index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-300'
            }`}>
              #{index + 1}
            </div>
            
            <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-brand/20 ml-4" alt={user.name} />
            
            <div className="ml-6 flex-1">
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>

            <div className="flex gap-8 mr-6 hidden md:flex">
              <div className="text-center">
                <div className="text-xl font-black text-brand">{user.eventsHelped}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Events</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-brand">{user.totalDonatedTime}h</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-brand">{user.totalDonatedItems}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Items</div>
              </div>
            </div>

            <div className="bg-brand text-white px-6 py-2 rounded-2xl font-black text-lg">
              {(user.eventsHelped * 10) + (user.totalDonatedTime * 5) + (user.totalDonatedItems * 2)}
              <span className="text-[10px] block font-bold leading-none text-white/80">POINTS</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[3rem] text-center space-y-6">
        <h2 className="text-3xl font-black">Want to see your name here?</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Every small act of kindness counts. Start by joining an event or making a small donation today.</p>
        <div className="flex justify-center gap-4">
          <button className="bg-brand text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-dark transition-all">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
