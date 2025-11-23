import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Amenity, AmenityType, Coordinates } from '../types';
import { AmenityIcon } from './Icons';

// Fix for default Leaflet marker icon not loading in unbundled environment
const iconMarker2x = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
const iconMarker = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const iconShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconMarker2x,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

interface MapUIProps {
  userLocation: Coordinates;
  amenities: Amenity[];
  isAdding: boolean;
  onMapClick: (location: Coordinates) => void;
}

// Subcomponent to handle map flyTo when user location changes
const MapUpdater: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
};

// Subcomponent to handle map clicks
const MapClickHandler: React.FC<{ onClick: (coords: Coordinates) => void, isActive: boolean }> = ({ onClick, isActive }) => {
  useMapEvents({
    click(e) {
      if (isActive) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

// Helper to get SVG string for map markers without using react-dom/server
const getAmenitySvgPath = (type: AmenityType): string => {
  switch (type) {
    case AmenityType.RESTROOM:
      return '<path d="M9 20v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5" /><path d="M9 4v2" /><path d="M15 4v2" /><circle cx="12" cy="7" r="4" /><line x1="12" y1="11" x2="12" y2="13" />';
    case AmenityType.WATER:
      return '<path d="M12 2c-3 4-7 6-7 11a7 7 0 0 0 14 0c0-5-4-7-7-11z" /><path d="M12 16v-4" />';
    case AmenityType.ATM:
      return '<rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" />';
    case AmenityType.BIKE_RACK:
      return '<circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-9 3-2-3-2 3-2h5l3 2-3 2 3 2-3 9v3.5" />';
    case AmenityType.BENCH:
      return '<path d="M15 15v-5l-4-4H7l-4 4v5" /><path d="M4 15h16" /><path d="M6 15v4" /><path d="M18 15v4" />';
    default:
      return '<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />';
  }
};

// Helper to create custom div icons for amenities
const createAmenityIcon = (type: AmenityType) => {
  // We construct the HTML string manually to avoid needing react-dom/server in the browser environment
  const svgPath = getAmenitySvgPath(type);
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">${svgPath}</svg>`;
  
  const iconHtml = `
    <div class="bg-white p-2 rounded-full shadow-lg border-2 border-brand-500 text-brand-600 flex items-center justify-center">
      ${svgString}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const MapUI: React.FC<MapUIProps> = ({ userLocation, amenities, isAdding, onMapClick }) => {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={15}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={userLocation} />
      <MapClickHandler onClick={onMapClick} isActive={isAdding} />

      {/* User Location Marker */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Amenity Markers */}
      {amenities.map((amenity) => (
        <Marker
          key={amenity.id}
          position={[amenity.location.lat, amenity.location.lng]}
          icon={createAmenityIcon(amenity.type)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                 <AmenityIcon type={amenity.type} className="w-4 h-4 text-brand-500" />
                 {amenity.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">{amenity.description}</p>
              <div className="text-[10px] text-slate-400 mt-2">
                Added {new Date(amenity.addedAt).toLocaleDateString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapUI;