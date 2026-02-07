
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { MOCK_EVENTS, OctopusLogo } from '../constants';
import { UserProfile } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-brand text-white p-12 lg:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <OctopusLogo className="w-96 h-96 transform translate-x-1/4 -translate-y-1/4" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
            Connect. Help. <br />Make Waves.
          </h1>
          <p className="text-xl text-white/90 mb-10 font-medium">
            Join the only event management platform that brings communities together through the power of volunteering and donation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/events" className="bg-white text-brand px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-50 transition-all hover:scale-105">
              Explore Events
            </Link>
            <Link to="/donate" className="bg-brand-dark text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
              Donate Today
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">Volunteer Map</h2>
            <p className="text-slate-500">Discover active helpers in your local community.</p>
          </div>
          <Link to="/volunteers" className="text-brand font-bold hover:underline">View All Volunteers →</Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MapView onUserSelect={setSelectedUser} />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-brand/5">
            <h3 className="text-xl font-bold mb-6">Nearby Helpers</h3>
            {selectedUser ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                <img src={selectedUser.avatar} className="w-full h-48 object-cover rounded-2xl" alt={selectedUser.name} />
                <div>
                  <h4 className="text-lg font-bold">{selectedUser.name}</h4>
                  <span className="text-brand text-sm font-bold bg-brand/10 px-2 py-1 rounded">{selectedUser.role}</span>
                  <p className="text-slate-500 text-sm mt-3 line-clamp-3">{selectedUser.bio}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Events Helped</span>
                    <span className="font-bold">{selectedUser.eventsHelped}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Skills</span>
                    <span className="font-bold text-right">{selectedUser.skills.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/volunteers/${selectedUser.id}`)}
                  className="w-full py-3 bg-slate-900 dark:bg-brand text-white rounded-xl font-bold mt-4"
                >
                  View Full Profile
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <OctopusLogo className="w-16 h-16 mb-4 opacity-20" />
                <p>Click on a map marker to see details of volunteers in your area!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          <Link to="/events" className="bg-brand/10 text-brand px-4 py-2 rounded-xl font-bold hover:bg-brand/20">All Events</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all">
              <div className="relative h-48">
                <img src={event.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={event.title} />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold text-brand">
                  {event.date}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand transition-colors">{event.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{event.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link 
                  to={`/events/${event.id}`}
                  className="block w-full text-center py-3 bg-slate-100 dark:bg-slate-700 font-bold rounded-xl group-hover:bg-brand group-hover:text-white transition-all"
                >
                  Join Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
