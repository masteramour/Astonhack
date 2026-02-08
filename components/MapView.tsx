import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../constants";
import { UserRole } from "../types";
import populationsData from "../populations.json";

// Mapping of location names to coordinates (global)
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  "New York City": [40.7128, -74.0060],
  "Los Angeles": [34.0522, -118.2437],
  "Chicago": [41.8781, -87.6298],
  "San Francisco": [37.7749, -122.4194],
  "Toronto": [43.6629, -79.3957],
  "Mexico City": [19.4326, -99.1332],
  "São Paulo": [-23.5505, -46.6333],
  "Buenos Aires": [-34.6037, -58.3816],
  "Lima": [-12.0464, -77.0428],
  "London": [51.5074, -0.1278],
  "Paris": [48.8566, 2.3522],
  "Berlin": [52.5200, 13.4050],
  "Amsterdam": [52.3676, 4.9041],
  "Madrid": [40.4168, -3.7038],
  "Rome": [41.9028, 12.4964],
  "Cairo": [30.0444, 31.2357],
  "Lagos": [6.5244, 3.3792],
  "Cape Town": [-33.9249, 18.4241],
  "Dubai": [25.2048, 55.2708],
  "Istanbul": [41.0082, 28.9784],
  "Tel Aviv": [32.0853, 34.7818],
  "Tokyo": [35.6762, 139.6503],
  "Seoul": [37.5665, 126.9780],
  "Beijing": [39.9042, 116.4074],
  "Shanghai": [31.2304, 121.4737],
  "Mumbai": [19.0760, 72.8777],
  "Bangkok": [13.7563, 100.5018],
  "Singapore": [1.3521, 103.8198],
  "Hong Kong": [22.3193, 114.1694],
  "Sydney": [-33.8688, 151.2093],
  "Auckland": [-37.7870, 174.7865]
};

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

// Create custom red icon for volunteer locations
const volunteerLocationIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMi4wODU4IDAgOC40MzY2NyAyLjEwNzE3IDUuNzg5MzcgNS43ODkzN0MzLjEwNzE3IDguNDM2NjcgMSAxMi4wODU4IDEgMTZDMSAyNC44Mjg0IDE2IDQ4IDE2IDQ4UzMxIDI0LjgyODQgMzEgMTZDMzEgMTIuMDg1OCAyOC44OTI4IDguNDM2NjcgMjYuMjEwNiA1Ljc4OTM3QzIzLjU2MzMgMi4xMDcxNyAxOS45MTQyIDAgMTYgMFpNMTYgMjJDMTMuNzkwOSAyMiAxMiAyMC4yMDkxIDEyIDE4QzEyIDE1Ljc5MDkgMTMuNzkwOSAxNCAxNiAxNEMxOC4yMDkxIDE0IDIwIDE1Ljc5MDkgMjAgMThDMjAgMjAuMjA5MSAxOC4yMDkxIDIyIDE2IDIyWiIgZmlsbD0iI2VmNDQ0NCIvPjwvc3ZnPg==',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48]
});

// Custom popup component for populations
const PopulationPopup = ({ location, data }: { location: string; data: any }) => {
  return (
    <div className="text-center min-w-[250px]">
      <strong className="text-sm block mb-2">{location}</strong>
      <div className="text-xs space-y-1 text-left">
        <div><span className="font-bold">Events:</span> {data.totalEvents}</div>
        <div><span className="font-bold">Total Participants:</span> {data.totalParticipants}</div>
        <div><span className="font-bold">Avg per Event:</span> {data.averageParticipantsPerEvent.toFixed(1)}</div>
        <div><span className="font-bold">Volunteers Needed:</span> {data.volunteerDemand}</div>
        <div><span className="font-bold">Success Rate:</span> {(data.successRate * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
};

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
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [proximityRadius, setProximityRadius] = useState(2); // km
  const [showAll, setShowAll] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // Request user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setIsLoadingLocation(false);
        },
        (error) => {
          // Fallback to Birmingham if geolocation fails or is denied
          console.warn('Geolocation error:', error);
          setCenter([52.5086, -1.8753]); // Birmingham center
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Browser doesn't support geolocation
      setCenter([52.5086, -1.8753]); // Birmingham center
      setIsLoadingLocation(false);
    }
  }, []);

  // Filter volunteers based on proximity
  const nearbyVolunteers = center ? MOCK_USERS.filter((user) => {
    if (showAll) return user.role === UserRole.VOLUNTEER;
    const distance = calculateDistance(center[0], center[1], user.location.lat, user.location.lng);
    return user.role === UserRole.VOLUNTEER && distance <= proximityRadius;
  }) : [];

  if (!center) {
    return (
      <div className="h-[600px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold">Detecting your location...</p>
        </div>
      </div>
    );
  }

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

        {/* Population data circles and markers */}
        {populationsData.locations.map((location) => {
          const coords = LOCATION_COORDINATES[location.location];
          if (!coords) return null;
          
          // Radius scales with volunteer demand (25 meters per volunteer needed)
          const radiusMeters = Math.max(200, location.volunteerDemand * 25);
          // Color based on success rate
          const successColor = location.successRate > 0.9 ? '#22c55e' : location.successRate > 0.85 ? '#3b82f6' : '#f59e0b';
          
          return (
            <g key={location.location}>
              <Circle
                center={coords}
                radius={radiusMeters}
                pathOptions={{ color: successColor, fillOpacity: 0.15, weight: 2, dashArray: '5, 5' }}
              />
              <Marker position={coords} icon={L.icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzMzNzhkYyIgb3BhY2l0eT0iMC44Ii8+PC9zdmc+', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, 0] })}>
                <Popup>
                  <PopulationPopup location={location.location} data={location} />
                </Popup>
              </Marker>
            </g>
          );
        })}

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
            icon={volunteerLocationIcon}
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
