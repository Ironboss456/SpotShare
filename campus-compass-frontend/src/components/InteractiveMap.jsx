import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Plus, Minus, Maximize2, Navigation, Check } from 'lucide-react';

const InteractiveMap = ({ amenities, categories, onAmenityClick, selectedAmenity }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // Campus buildings for visual reference
  const buildings = [
    { name: 'Suzzallo Library', x: 42, y: 32, width: 12, height: 8, color: 'bg-red-300' },
    { name: 'Odegaard Library', x: 52, y: 38, width: 10, height: 7, color: 'bg-blue-300' },
    { name: 'HUB', x: 58, y: 52, width: 14, height: 10, color: 'bg-purple-300' },
    { name: 'Anderson Hall', x: 32, y: 42, width: 9, height: 8, color: 'bg-yellow-300' },
    { name: 'Kane Hall', x: 45, y: 50, width: 11, height: 9, color: 'bg-orange-300' },
    { name: 'Allen Library', x: 48, y: 65, width: 10, height: 6, color: 'bg-green-300' },
    { name: 'Communications', x: 35, y: 58, width: 8, height: 7, color: 'bg-pink-300' },
    { name: 'Mary Gates Hall', x: 62, y: 38, width: 9, height: 7, color: 'bg-indigo-300' },
  ];

  // Pathways for visual realism
  const pathways = [
    // Horizontal paths
    { x1: 10, y1: 40, x2: 90, y2: 40 },
    { x1: 10, y1: 55, x2: 90, y2: 55 },
    { x1: 10, y1: 70, x2: 90, y2: 70 },
    // Vertical paths
    { x1: 40, y1: 20, x2: 40, y2: 80 },
    { x1: 55, y1: 20, x2: 55, y2: 80 },
    { x1: 70, y1: 20, x2: 70, y2: 80 },
  ];

  // Green spaces
  const greenSpaces = [
    { name: 'Quad', x: 38, y: 48, radius: 8 },
    { name: 'Red Square', x: 50, y: 45, radius: 6 },
    { name: 'Drumheller Fountain', x: 60, y: 48, radius: 4 },
  ];

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => mapElement.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white hover:bg-gray-100 p-2 rounded-lg shadow-lg transition-colors"
          title="Zoom In"
        >
          <Plus size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white hover:bg-gray-100 p-2 rounded-lg shadow-lg transition-colors"
          title="Zoom Out"
        >
          <Minus size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleResetView}
          className="bg-white hover:bg-gray-100 p-2 rounded-lg shadow-lg transition-colors"
          title="Reset View"
        >
          <Maximize2 size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-20 bg-white px-3 py-2 rounded-lg shadow-lg">
        <span className="text-sm font-semibold text-gray-700">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-20 bg-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-xs text-gray-600">
          🖱️ Drag to pan • Scroll to zoom • Click pins for details
        </p>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <div
          className="w-full h-full relative transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Background - Campus Ground */}
          <div className="absolute inset-0 bg-white">
            {/* Grass texture effect */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" 
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(0,100,0,0.1) 10px,
                    rgba(0,100,0,0.1) 20px
                  )`
                }}
              />
            </div>
          </div>

          {/* Pathways */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {pathways.map((path, idx) => (
              <line
                key={idx}
                x1={`${path.x1}%`}
                y1={`${path.y1}%`}
                x2={`${path.x2}%`}
                y2={`${path.y2}%`}
                stroke="#9ca3af"
                strokeWidth="2"
                opacity="0.6"
              />
            ))}
          </svg>

          {/* Green Spaces (Parks/Quads) */}
          {greenSpaces.map((space, idx) => (
            <div
              key={idx}
              className="absolute bg-green-200 rounded-full opacity-50 flex items-center justify-center"
              style={{
                left: `${space.x}%`,
                top: `${space.y}%`,
                width: `${space.radius * 2}%`,
                height: `${space.radius * 2}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}
            >
              <span className="text-xs text-green-800 font-semibold opacity-70">
                {space.name}
              </span>
            </div>
          ))}

          {/* Buildings */}
          {buildings.map((building, idx) => (
            <div
              key={idx}
              className={`absolute ${building.color} rounded-lg shadow-md border-2 border-gray-400 flex items-center justify-center overflow-hidden transition-transform hover:scale-105`}
              style={{
                left: `${building.x}%`,
                top: `${building.y}%`,
                width: `${building.width}%`,
                height: `${building.height}%`,
                zIndex: 3
              }}
            >
              {/* Building windows effect */}
              <div className="absolute inset-0 grid grid-cols-3 gap-1 p-1 opacity-30">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-sm" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-gray-800 relative z-10 text-center px-1">
                {building.name}
              </span>
            </div>
          ))}

          {/* Amenity Pins */}
          {amenities.map(amenity => {
            const category = categories.find(c => c.id === amenity.category);
            const isSelected = selectedAmenity?.id === amenity.id;
            
            return (
              <button
                key={amenity.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAmenityClick(amenity);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 ${
                  isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-40'
                }`}
                style={{ 
                  left: `${amenity.location.x}%`, 
                  top: `${amenity.location.y}%`,
                  pointerEvents: 'auto'
                }}
              >
                {/* Pin shadow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-black opacity-20 rounded-full blur-sm" />
                
                {/* Pin body */}
                <div className={`relative ${category?.color} p-3 rounded-full shadow-lg ${
                  isSelected ? 'ring-4 ring-white ring-offset-2' : ''
                }`}>
                  <MapPin className="text-white" size={24} />
                  
                  {/* Verified badge */}
                  {amenity.verified && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                      <Check size={12} className="text-white" />
                    </div>
                  )}

                  {/* Pulse animation for selected */}
                  {isSelected && (
                    <div className={`absolute inset-0 ${category?.color} rounded-full animate-ping opacity-75`} />
                  )}
                </div>

                {/* Label on hover or when selected */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-opacity duration-200 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {amenity.name}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                </div>
              </button>
            );
          })}

          {/* North indicator */}
          <div className="absolute top-8 left-8 bg-white rounded-full p-3 shadow-lg z-10">
            <Navigation size={24} className="text-red-500 transform rotate-0" />
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
              N
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 max-w-xs z-20">
        <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={16} />
          Map Legend
        </div>
        <div className="space-y-2">
          {categories.slice(1).map(cat => (
            <div key={cat.id} className="flex items-center gap-2">
              <div className={`${cat.color} w-4 h-4 rounded-full`}></div>
              <span className="text-xs text-gray-700">{cat.name}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
              <span className="text-xs text-gray-700">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;