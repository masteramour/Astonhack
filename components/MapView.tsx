
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface MapViewProps {
  onUserSelect: (user: UserProfile) => void;
}

const MapView: React.FC<MapViewProps> = ({ onUserSelect }) => {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default NYC
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.warn("Geolocation denied, using default NYC center.", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  }, []);
  
  // Simple formula to map coordinates to a 100x100 grid for visualization
  // Zoomed in relative to current center
  const mapToGrid = (lat: number, lng: number) => {
    const x = 50 + ((lng - center.lng) * 500); 
    const y = 50 - ((lat - center.lat) * 500);
    return { x, y };
  };

  const calculateDistance = (uLat: number, uLng: number) => {
    const r = 6371; // Earth's radius in km
    const dLat = (uLat - center.lat) * Math.PI / 180;
    const dLon = (uLng - center.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(center.lat * Math.PI / 180) * Math.cos(uLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (r * c).toFixed(1);
  };

  return (
    <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #FF6B00 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-5 pointer-events-none">
        {[...Array(144)].map((_, i) => (
          <div key={i} className="border-[0.5px] border-slate-400"></div>
        ))}
      </div>

      {/* User Markers */}
      {MOCK_USERS.map((user) => {
        const { x, y } = mapToGrid(user.location.lat, user.location.lng);
        const distance = calculateDistance(user.location.lat, user.location.lng);
        
        return (
          <div 
            key={user.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onUserSelect(user)}
          >
            <div className={`w-10 h-10 rounded-2xl border-2 border-white shadow-xl overflow-hidden transition-all group-hover:scale-125 group-hover:rotate-6 ${
              user.role === UserRole.VOLUNTEER ? 'bg-orange-500' : 'bg-slate-700'
            }`}>
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
              <div className="bg-slate-900 text-white text-xs p-3 rounded-2xl whitespace-nowrap shadow-2xl border border-white/10">
                <div className="font-black text-sm">{user.name}</div>
                <div className="text-[10px] text-brand font-bold mt-1 uppercase tracking-widest">{distance} km away</div>
              </div>
              <div className="w-3 h-3 bg-slate-900 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-white/10"></div>
            </div>
          </div>
        );
      })}

      {/* Real-time Center Marker (Pulse) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="w-8 h-8 bg-brand/20 rounded-full animate-ping"></div>
        <div className="w-4 h-4 bg-brand rounded-full border-2 border-white shadow-[0_0_30px_rgba(255,107,0,0.6)] absolute top-2 left-2"></div>
      </div>

      {isLocating && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-brand uppercase tracking-widest text-xs">Calibrating Sonar...</p>
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 p-5 rounded-[2rem] shadow-2xl backdrop-blur text-xs border border-brand/10">
        <h4 className="font-black mb-3 uppercase tracking-tighter text-sm">Octo-Locator</h4>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-orange-500 rounded-lg shadow-sm"></div>
            <span className="font-bold text-slate-500">Volunteer Units</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-slate-700 rounded-lg shadow-sm"></div>
            <span className="font-bold text-slate-500">Event Managers</span>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-4 h-4 bg-brand rounded-full shadow-[0_0_8px_rgba(255,107,0,0.5)]"></div>
            <span className="font-bold text-brand">Your Coordinates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;