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

function AddPin({ onAdd }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      const { lat, lng } = e.latlng;

      const popupDiv = L.DomUtil.create('div', 'add-pin-popup');
      popupDiv.innerHTML = `
        <div style="text-align:center; font-family:sans-serif;">
          <h3>📍 Add a New Place Here?</h3>
          <p>Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}</p>
        </div>
      `;

      const button = L.DomUtil.create('button', '', popupDiv);
      button.textContent = 'Add This Location';
      Object.assign(button.style, {
        marginTop: '8px',
        background: '#7e22ce',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
      });

      const popup = L.popup()
        .setLatLng([lat, lng])
        .setContent(popupDiv)
        .openOn(map);

      L.DomEvent.on(button, 'click', () => {
        map.closePopup();
        onAdd({ lat, lng });
      });
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, onAdd]);

  return null;
}





const RealMap = ({ amenities, categories, onAmenityClick, selectedAmenity, onAddLocation }) => {

  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // University of Washington coordinates as default center
  const defaultCenter = [47.6553, -122.3035];
  const [mapCenter] = useState(defaultCenter);

  const getMarkerColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const colorMap = {
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316',
      'bg-pink-500': '#ec4899',
      'bg-yellow-500': '#eab308',
      'bg-green-500': '#22c55e',
      'bg-blue-500': '#3b82f6',
    };
    return colorMap[category?.color] || '#3b82f6';
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
        <AddPin onAdd={onAddLocation} />


        {/* Amenity Markers */}
        {amenities.map((amenity) => {
          const category = categories.find(c => c.id === amenity.category);
          const Icon = category?.icon || MapPin;
          const markerColor = getMarkerColor(amenity.category);
          const isSelected = selectedAmenity?.id === amenity.id;

          return (
            <Marker
              key={amenity.id}
              position={[amenity.location.lat, amenity.location.lng]}
              icon={createCustomIcon(markerColor, amenity.verified)}
              eventHandlers={{
                click: () => onAmenityClick(amenity),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup className="custom-popup" minWidth={250} maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`${category?.color} p-2 rounded-lg`}>
                      <Icon className="text-white" size={20} />
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
                    "{amenity.aiSummary.substring(0, 100)}..."
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {amenity.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onAmenityClick(amenity)}
                    className="w-full bg-purple-600 text-white text-sm py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom Zoom Controls (Google Maps style) */}
      <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => {
            const map = document.querySelector('.leaflet-container');
            if (map) map._leaflet_map.zoomIn();
          }}
          className="px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="Zoom in"
        >
          <span className="text-gray-700 font-bold text-xl">+</span>
        </button>
        <button
          onClick={() => {
            const map = document.querySelector('.leaflet-container');
            if (map) map._leaflet_map.zoomOut();
          }}
          className="px-3 py-2 hover:bg-gray-100 transition-colors"
          title="Zoom out"
        >
          <span className="text-gray-700 font-bold text-xl">−</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        <div className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin size={16} />
          Categories
        </div>
        <div className="space-y-1">
          {categories.slice(1).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div
                className={`${cat.color} w-3 h-3 rounded-full`}
                style={{ backgroundColor: getMarkerColor(cat.id) }}
              ></div>
              <span className="text-xs text-gray-700">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
        <p className="text-xs text-gray-600">
          🖱️ Click markers for info • Drag to pan • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default RealMap;