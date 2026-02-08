
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../constants';

const EventsPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const tags = ['All', ...new Set(MOCK_EVENTS.flatMap(e => e.tags))];

  const filteredEvents = filter === 'All' 
    ? MOCK_EVENTS 
    : MOCK_EVENTS.filter(e => e.tags.includes(filter));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black">Community Events</h1>
          <p className="text-slate-500 mt-2">Find a mission that speaks to you.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tag 
                  ? 'bg-brand text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-brand/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all">
            <div className="relative h-56">
              <img src={event.image} className="w-full h-full object-cover" alt={event.title} />
              <div className="absolute top-4 left-4 flex gap-2">
                {event.tags.map(t => (
                  <span key={t} className="bg-brand/90 text-white text-[10px] px-2 py-1 rounded font-black uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 text-brand font-bold text-sm mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <h2 className="text-2xl font-bold mb-3">{event.title}</h2>
              <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>
              
              <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <img key={i} src={`https://picsum.photos/seed/${event.id}${i}/40`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" alt="volunteer" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                    +{event.volunteersJoined.length}
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {event.volunteersNeeded - event.volunteersJoined.length} spots left
                </div>
              </div>

              <Link 
                to={`/events/${event.id}`}
                className="block w-full text-center py-4 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 mt-4"
              >
                Join Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
