import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../constants";
import { UserRole } from "../types";

// Function to calculate distance between two coordinates (in km)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Create custom blue icon for user location
const userLocationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMi4wODU4IDAgOC40MzY2NyAyLjEwNzE3IDUuNzg5MzcgNS43ODkzN0MzLjEwNzE3IDguNDM2NjcgMSAxMi4wODU4IDEgMTZDMSAyNC44Mjg0IDE2IDQ4IDE2IDQ4UzMxIDI0LjgyODQgMzEgMTZDMzEgMTIuMDg1OCAyOC44OTI4IDguNDM2NjcgMjYuMjEwNiA1Ljc4OTM3QzIzLjU2MzMgMi4xMDcxNyAxOS45MTQyIDAgMTYgMFpNMTYgMjJDMTMuNzkwOSAyMiAxMiAyMC4yMDkxIDEyIDE4QzEyIDE1Ljc5MDkgMTMuNzkwOSAxNCAxNiAxNEMxOC4yMDkxIDE0IDIwIDE1Ljc5MDkgMjAgMThDMjAgMjAuMjA5MSAxOC4yMDkxIDIyIDE2IDIyWiIgZmlsbD0iIzMzNjZjYyIvPjwvc3ZnPg==',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48]
});

// Custom popup component for volunteers
const VolunteerPopup = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center min-w-[200px]">
      <strong className="text-sm">{user.name}</strong>
      <br />
      <span className="text-xs text-slate-600">{user.role}</span>
      <br />
      <div className="mt-2 pt-2 border-t border-slate-200">
        <button
          onClick={() => navigate(`/volunteers/${user.id}`)}
          className="text-xs bg-brand text-white px-3 py-1 rounded hover:bg-brand-dark transition-colors font-bold w-full mt-2"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default function MapView({ onUserSelect }) {
  const navigate = useNavigate();
  const [center, setCenter] = useState<[number, number]>([51.5072, -0.1276]); // UK default
  const [proximityRadius, setProximityRadius] = useState(2); // km
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setCenter([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  // Filter volunteers based on proximity
  const nearbyVolunteers = MOCK_USERS.filter((user) => {
    if (showAll) return user.role === UserRole.VOLUNTEER;
    const distance = calculateDistance(center[0], center[1], user.location.lat, user.location.lng);
    return user.role === UserRole.VOLUNTEER && distance <= proximityRadius;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Proximity Radius:</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={proximityRadius}
              onChange={(e) => setProximityRadius(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-bold text-brand">{proximityRadius} km</span>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Show all volunteers</span>
        </label>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400 px-2">
        Found <span className="font-bold text-brand">{nearbyVolunteers.length}</span> volunteer(s) nearby
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Proximity radius circle */}
        <Circle
          center={center}
          radius={proximityRadius * 1000} // Convert km to meters
          pathOptions={{ color: "brand", fillOpacity: 0.1, weight: 2 }}
        />

        {/* User's current location marker */}
        <Marker
          position={center}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
              <br />
              <span className="text-xs text-slate-600">{center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
            </div>
          </Popup>
        </Marker>

        {/* Volunteer pins */}
        {nearbyVolunteers.map((user) => (
          <Marker
            key={user.id}
            position={[user.location.lat, user.location.lng]}
            eventHandlers={{
              click: () => onUserSelect(user),
            }}
          >
            <Popup>
              <VolunteerPopup user={user} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
