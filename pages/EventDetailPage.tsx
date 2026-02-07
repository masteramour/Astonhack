
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_EVENTS, MOCK_USERS } from '../constants';

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const event = MOCK_EVENTS.find(e => e.id === id);
  const manager = MOCK_USERS.find(u => u.id === event?.managerId);

  if (!event) return <div className="p-20 text-center">Event not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <Link to="/events" className="inline-flex items-center gap-2 text-brand font-bold hover:gap-4 transition-all mb-4">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
        Back to Events
      </Link>

      <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
        <img src={event.image} className="w-full h-full object-cover" alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map(t => <span key={t} className="bg-brand text-white px-3 py-1 rounded-lg text-xs font-black uppercase">{t}</span>)}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-3xl font-black mb-6">About this mission</h2>
            <p className="text-xl text-slate-500 leading-relaxed dark:text-slate-400">{event.description}</p>
          </section>

          <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-brand/10">
            <h3 className="text-xl font-bold mb-6">Volunteers already joined</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {event.volunteersJoined.map(vId => {
                const vol = MOCK_USERS.find(u => u.id === vId);
                return (
                  <Link key={vId} to={`/volunteers/${vId}`} className="text-center group">
                    <img src={vol?.avatar} className="w-20 h-20 rounded-[1.5rem] mx-auto mb-2 border-2 border-brand/20 group-hover:scale-110 transition-all" alt={vol?.name} />
                    <div className="text-xs font-bold truncate">{vol?.name}</div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-brand text-white p-8 rounded-[2rem] shadow-xl shadow-brand/20 space-y-6">
            <div>
              <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Date</div>
              <div className="text-xl font-bold">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
            </div>
            <div>
              <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Location</div>
              <div className="text-xl font-bold">{event.location}</div>
            </div>
            <div className="pt-6 border-t border-white/20">
              <button className="w-full py-4 bg-white text-brand font-black rounded-2xl shadow-lg hover:bg-slate-100 transition-all">
                Join Event Now
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">Event Manager</h3>
            <Link to={`/volunteers/${manager?.id}`} className="flex items-center gap-4 group">
              <img src={manager?.avatar} className="w-16 h-16 rounded-2xl object-cover" alt={manager?.name} />
              <div>
                <div className="font-bold group-hover:text-brand transition-colors">{manager?.name}</div>
                <div className="text-xs text-slate-500">{manager?.role}</div>
              </div>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetailPage;
