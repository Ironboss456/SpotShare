import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const createCustomIcon = (color, isSelected) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 3.54 4.29 8.68 6.32 10.55.63.6 1.68.6 2.31 0C14.71 17.68 19 12.54 19 9c0-3.87-3.13-7-7-7zm0 14.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3C/svg%3E`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    shadowUrl: null,
    shadowSize: null,
    className: isSelected ? 'selected-marker' : '',
  });
};

const RealMap = ({ amenities, categories, events = [], onAmenityClick, onEventClick, selectedAmenity, onAddLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (amenities.length > 0) {
      const bounds = amenities.map((amenity) => [amenity.location.lat, amenity.location.lng]);
      map.fitBounds(bounds);
    }
  }, [amenities, map]);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} className="h-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Amenity Markers */}
      {amenities.map((amenity) => {
        const isSelectedAmenity = selectedAmenity?.id === amenity._id || selectedAmenity?._id === amenity._id;
        return (
          <Marker
            key={amenity._id || amenity.id}
            position={[amenity.location.lat, amenity.location.lng]}
            icon={createCustomIcon('#3b82f6', isSelectedAmenity)}
            eventHandlers={{
              click: () => onAmenityClick && onAmenityClick(amenity),
            }}
            zIndexOffset={isSelectedAmenity ? 1000 : 0}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900">{amenity.title}</h3>
                <p className="text-sm text-gray-700 mt-2">{amenity.description}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {/* Event Markers */}
      {events.map((ev) => {
        const isSelectedEvent = selectedAmenity?.id === ev._id || selectedAmenity?._id === ev._id;
        return (
          <Marker
            key={ev._id || ev.id}
            position={[ev.location.lat, ev.location.lng]}
            icon={createCustomIcon('#ef4444', false)}
            eventHandlers={{
              click: () => onEventClick && onEventClick(ev),
            }}
            zIndexOffset={isSelectedEvent ? 1000 : 0}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900">{ev.title}</h3>
                {ev.date && <div className="text-xs text-gray-600">{new Date(ev.date).toLocaleString()}</div>}
                <p className="text-sm text-gray-700 mt-2">{ev.description}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default RealMap;