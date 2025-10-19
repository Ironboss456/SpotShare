import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Check, Star, Users, MapPin, Navigation2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different categories
const createCustomIcon = (color, verified) => {
  const svgIcon = `
    <svg width="32" height="45" viewBox="0 0 32 45" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M16 0C9.4 0 4 5.4 4 12c0 8 12 28 12 28s12-20 12-28c0-6.6-5.4-12-12-12z" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="12" r="6" fill="white"/>
        ${verified ? '<circle cx="16" cy="12" r="3" fill="#3B82F6"/>' : ''}
      </g>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 45],
    iconAnchor: [16, 45],
    popupAnchor: [0, -45],
  });
};

// Component to handle map centering when amenity is selected
const MapController = ({ selectedAmenity }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedAmenity) {
      map.setView(
        [selectedAmenity.location.lat, selectedAmenity.location.lng],
        17,
        { animate: true, duration: 1 }
      );
    }
  }, [selectedAmenity, map]);
  
  return null;
};

// === Add this inside RealMap.jsx ===

function AddPin({ onAdd, onCreateEvent }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      // Open the app-level creation modal by calling the provided callback with coords
      if (typeof onAdd === 'function') {
        onAdd({ lat, lng });
      } else if (typeof onCreateEvent === 'function') {
        // fallback: create directly if no modal handler is provided
        onCreateEvent({ title: 'New Event', description: '', location: { lat, lng } });
      }
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onAdd, onCreateEvent]);

  return null;
}





const RealMap = ({ amenities, categories, events = [], onAmenityClick, onEventClick, selectedAmenity, onAddLocation, onCreateEvent, onDeleteEvent, onDeleteAmenity }) => {

  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // University of Washington coordinates as default center
  const defaultCenter = [47.6553, -122.3035];
  const [mapCenter] = useState(defaultCenter);

  const getMarkerColor = (categoryId) => {
    // explicit palette covering frontend and legacy categories
    const categoryColorMap = {
      // legacy / sample categories
      study: '#8b5cf6',       // purple
      tech: '#06b6d4',        // cyan
      wellness: '#10b981',    // green
      food: '#f97316',        // orange
      social: '#ec4899',      // pink
      // frontend top-level categories
      events: '#a855f7',      // purple-500
      water: '#60a5fa',       // blue-400
      restrooms: '#9ca3af',   // gray-400
      atms: '#fbbf24',        // yellow-400
      avoid: '#ef4444',       // red-500
      bikes: '#16a34a',       // green-600
    };

    if (!categoryId) return '#3b82f6';
    if (categoryColorMap[categoryId]) return categoryColorMap[categoryId];

    // fallback: if a category object exists in the provided categories prop, try to map its color class
    const category = categories.find(c => c.id === categoryId);
    const classToHex = {
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316',
      'bg-pink-500': '#ec4899',
      'bg-yellow-500': '#eab308',
      'bg-green-500': '#22c55e',
      'bg-blue-500': '#3b82f6',
      'bg-blue-400': '#60a5fa',
      'bg-gray-400': '#9ca3af',
      'bg-yellow-400': '#fbbf24',
      'bg-red-400': '#ef4444',
      'bg-green-600': '#16a34a'
    };
    if (category && category.color && classToHex[category.color]) return classToHex[category.color];

    return '#3b82f6';
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] rounded-2xl overflow-hidden shadow-xl z-0">
      {showHint && (
      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/90 text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm z-[1000] animate-fade">
        💡 Click anywhere on the map to add a new place!
      </div>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >

        {/* Map Tiles - Using OpenStreetMap (free, no API key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Alternative: Google Maps style (requires attribution) */}
        {/* <TileLayer
          attribution='Map data &copy; OpenStreetMap contributors'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        /> */}

        {/* Map Controller */}
        <MapController selectedAmenity={selectedAmenity} />
        <AddPin onAdd={onAddLocation} onCreateEvent={onCreateEvent} />


        {/* Event Markers */}
        {events.map((ev, evIndex) => {
          const lat = ev.location?.lat ?? ev.location?.x;
          const lng = ev.location?.lng ?? ev.location?.y;
          const markerColor = getMarkerColor(ev.category);

          if (lat == null || lng == null) {
            // if the event has a rawLocation string, render a marker at the default center with popup explaining missing coords
            if (ev.rawLocation) {
              return (
                <Marker
                  key={ev._id || ev.id}
                  position={mapCenter}
                  icon={createCustomIcon(markerColor, false)}
                  eventHandlers={{ click: () => onEventClick && onEventClick(ev) }}
                >
                  <Popup minWidth={320} maxWidth={420}>
                    <div className="p-2">
                      <h3 className="font-bold text-gray-900">{ev.title || ev.name}</h3>
                      <div className="text-xs text-gray-600">Location: {ev.rawLocation}</div>
                      {ev.description && <p className="text-sm text-gray-700 mt-2">{ev.description}</p>}
                      {(ev.features || []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(ev.features || []).slice(0, 3).map((f, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          }

          const isSelectedEvent = selectedAmenity && (selectedAmenity._id === ev._id || selectedAmenity.id === ev.id || selectedAmenity._id === ev.id || selectedAmenity.id === ev._id);
          return (
            <Marker
              key={ev._id || ev.id || `event-${evIndex}`}
              position={[lat, lng]}
              icon={createCustomIcon(markerColor, false)}
              eventHandlers={{ click: () => onEventClick && onEventClick(ev) }}
              zIndexOffset={isSelectedEvent ? 1000 : 0}
            >
              <Popup minWidth={320} maxWidth={420}>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900">{ev.title || ev.name}</h3>
                  {ev.description && <p className="text-sm text-gray-700 mt-2">{ev.description}</p>}
                  {(ev.features || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(ev.features || []).slice(0, 3).map((f, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{f}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this event?')) return;
                        const id = ev._id || ev.id;
                        try {
                          // try deleting from events endpoint first
                          let res = await fetch(`http://localhost:5001/api/events/public/${id}`, { method: 'DELETE' });
                          if (res.ok) {
                            onEventClick && onEventClick(null);
                            if (typeof onDeleteEvent === 'function') onDeleteEvent(id);
                            return;
                          }
                          // fallback: try deleting as an amenity (some events are saved into amenities)
                          res = await fetch(`http://localhost:5001/api/amenities/public/${id}`, { method: 'DELETE' });
                          if (res.ok) {
                            onEventClick && onEventClick(null);
                            if (typeof onDeleteAmenity === 'function') onDeleteAmenity(id);
                            return;
                          }
                          // if neither succeeded, throw
                          throw new Error('Delete returned non-ok');
                        } catch (e) {
                          console.error('Delete failed', e);
                          alert('Failed to delete event/amenity');
                        }
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Amenity Markers */}
        {amenities.map((amenity, aIndex) => {
          const category = categories.find(c => c.id === amenity.category);
          const Icon = category?.icon || MapPin;
          const markerColor = getMarkerColor(amenity.category);
          const isSelected = selectedAmenity?.id === amenity.id;

          return (
            <Marker
              key={amenity._id || amenity.id || `amenity-${aIndex}`}
              position={[amenity.location.lat, amenity.location.lng]}
              icon={createCustomIcon(markerColor, amenity.verified)}
              eventHandlers={{
                click: () => onAmenityClick(amenity),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup className="custom-popup" minWidth={320} maxWidth={420}>
                <div className="p-2">
                  <div className="flex items-start gap-4">
                    {/* show a colored square matching the marker color */}
                    <div className="p-3 rounded-xl" style={{ backgroundColor: getMarkerColor(amenity.category) }}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {amenity.name}
                        {amenity.verified && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} />
                            Verified
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={12} />
                          <span className="font-semibold">{amenity.rating}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{amenity.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 italic mb-2">
                    "{(amenity.aiSummary || '').substring(0, 100)}"
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {(amenity.features || []).slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Delete button for amenities (public/demo delete) */}
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this spot?')) return;
                      const id = amenity._id || amenity.id;
                      try {
                        const res = await fetch(`http://localhost:5001/api/amenities/public/${id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Delete failed');
                        // notify parent to remove from UI
                        onAmenityClick && onAmenityClick(null);
                        if (typeof onDeleteAmenity === 'function') onDeleteAmenity(id);
                      } catch (e) {
                        console.error('Amenity delete failed', e);
                        alert('Failed to delete spot');
                      }
                    }}
                    className="mt-2 w-full bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                 </div>
               </Popup>
             </Marker>
           );
         })}
      </MapContainer>
    </div>
  );
};

export default RealMap;
