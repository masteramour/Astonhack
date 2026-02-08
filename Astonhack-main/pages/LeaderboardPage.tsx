
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LeaderboardUser {
  userId: string;
  name: string;
  totalPoints: number;
  currentStreak: number;
  level: number;
  activities?: any[];
}

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/points');
        if (response.ok) {
          const data = await response.json();
          // Convert users object to array and sort by points
          const usersArray = Object.values(data.users as Record<string, LeaderboardUser>)
            .filter(u => u.totalPoints > 0)
            .sort((a, b) => b.totalPoints - a.totalPoints);
          setUsers(usersArray);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-2xl font-bold text-slate-400">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black">Top Contributors</h1>
        <p className="text-slate-500">Celebrating the amazing humans who power our community.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-slate-400">No users on the leaderboard yet. Start earning points by showing interest in community requests!</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div 
              key={user.userId} 
              className={`flex items-center p-6 rounded-[2rem] bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02] ${
                index === 0 ? 'border-brand border-2 bg-brand/5' : ''
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl ${
                index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-600' : 'text-slate-300'
              }`}>
                #{index + 1}
              </div>
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-dark/20 flex items-center justify-center ml-4 border-2 border-brand/20">
                <span className="text-2xl font-black text-brand">{user.name[0]}</span>
              </div>
              
              <div className="ml-6 flex-1">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-sm text-slate-500">Level {user.level} • {user.currentStreak} day streak 🔥</p>
              </div>

              <div className="flex gap-8 mr-6 hidden md:flex">
                <div className="text-center">
                  <div className="text-xl font-black text-brand">{user.currentStreak}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-brand">{user.level}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-brand">{user.activities?.length || 0}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Actions</div>
                </div>
              </div>

              <div className="bg-brand text-white px-6 py-2 rounded-2xl font-black text-lg">
                {user.totalPoints}
                <span className="text-[10px] block font-bold leading-none text-white/80">POINTS</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-900 text-white p-12 rounded-[3rem] text-center space-y-6">
        <h2 className="text-3xl font-black">Want to see your name here?</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Every small act of kindness counts. Start by joining an event or making a small donation today.</p>
        <div className="flex justify-center gap-4">
          <Link to="/donate" className="bg-brand text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-dark transition-all">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
