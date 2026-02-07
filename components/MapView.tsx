
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface MapViewProps {
  onUserSelect: (user: UserProfile) => void;
}

const MapView: React.FC<MapViewProps> = ({ onUserSelect }) => {
  const [center] = useState({ lat: 40.7128, lng: -74.0060 }); // Mock user center (NYC)
  
  // Simple formula to map coordinates to a 100x100 grid for visualization
  // In a real app, we'd use Leaflet or Mapbox
  const mapToGrid = (lat: number, lng: number) => {
    const x = ((lng + 74.05) / 0.15) * 100; // Zoomed in to NYC area
    const y = 100 - ((lat - 40.65) / 0.15) * 100;
    return { x, y };
  };

  const calculateDistance = (uLat: number, uLng: number) => {
    // Rough estimate in kilometers
    const r = 6371;
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
    <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden shadow-inner border-4 border-white dark:border-slate-700">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, #FF6B00 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
        {[...Array(100)].map((_, i) => (
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
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden transition-transform group-hover:scale-125 ${
              user.role === UserRole.VOLUNTEER ? 'bg-orange-500' : 'bg-slate-700'
            }`}>
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap shadow-xl">
                <span className="font-bold">{user.name}</span>
                <div className="text-[10px] text-slate-300">~{distance} km away</div>
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        );
      })}

      {/* Center Marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-ping"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg absolute top-0"></div>
      </div>

      <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl shadow-lg backdrop-blur text-xs">
        <h4 className="font-bold mb-2">Map Legend</h4>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Volunteer</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
          <span>Manager/Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>You (Your Location)</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
