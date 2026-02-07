
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_USERS, MOCK_EVENTS, OctopusLogo } from '../constants';

const VolunteerDetailPage: React.FC = () => {
  const { id } = useParams();
  const user = MOCK_USERS.find(u => u.id === id);
  const userEvents = MOCK_EVENTS.filter(e => e.volunteersJoined.includes(user?.id || ''));

  if (!user) return <div className="p-20 text-center">User not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-bottom duration-500">
      <div className="relative bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-2xl overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
          <OctopusLogo className="w-96 h-96" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <img src={user.avatar} className="w-64 h-64 rounded-[3rem] object-cover shadow-2xl border-4 border-brand/20" alt={user.name} />
          
          <div className="flex-1 text-center md:text-left space-y-6">
            <div>
              <span className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest">
                {user.role}
              </span>
              <h1 className="text-5xl lg:text-7xl font-black mt-4">{user.name}</h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 mt-4 max-w-2xl">{user.bio}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {user.skills.map(skill => (
                <span key={skill} className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 py-6 border-y border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinecap="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</div>
                  <a href={`mailto:${user.email}`} className="text-brand font-bold hover:underline">{user.email}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone</div>
                  <a href={`tel:${user.phone}`} className="text-brand font-bold hover:underline">{user.phone}</a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-12 pt-6">
              <div className="text-center md:text-left">
                <div className="text-4xl font-black text-brand">{user.eventsHelped}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Events Helped</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl font-black text-brand">{user.totalDonatedTime}h</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Donated Time</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl font-black text-brand">{user.totalDonatedItems}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Items Given</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-8">
          <h2 className="text-3xl font-black">History with 8vents</h2>
          <div className="space-y-4">
            {userEvents.length > 0 ? userEvents.map(event => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="block bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:border-brand/50 transition-all flex items-center gap-6 group"
              >
                <img src={event.image} className="w-24 h-24 rounded-2xl object-cover" alt={event.title} />
                <div className="flex-1">
                  <h4 className="text-xl font-bold group-hover:text-brand transition-colors">{event.title}</h4>
                  <div className="text-sm text-slate-400 mt-1">{new Date(event.date).toLocaleDateString()}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </Link>
            )) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[2rem] text-center text-slate-400">
                No events joined yet.
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-900 text-white p-12 rounded-[3rem] space-y-8">
          <h2 className="text-3xl font-black">Send a Message</h2>
          <p className="text-slate-400">Want to coordinate on an event or ask about {user.name.split(' ')[0]}'s skills?</p>
          <div className="space-y-4">
            <textarea 
              className="w-full bg-slate-800 border-none rounded-2xl p-6 text-white focus:ring-2 focus:ring-brand h-40"
              placeholder="Write your message here..."
            ></textarea>
            <button className="w-full py-5 bg-brand text-white font-black rounded-3xl shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all">
              Send Tentacle Signal 🐙
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VolunteerDetailPage;
