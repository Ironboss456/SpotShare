import React, { useState, useEffect } from 'react';
import MapUI from './components/MapUI';
import AddAmenityForm from './components/AddAmenityForm';
import FilterBar from './components/FilterBar';
import { Amenity, Coordinates, AmenityType } from './types';
import { Plus, Map as MapIcon, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 34.0522, lng: -118.2437 });
  const [isAdding, setIsAdding] = useState(false);
  const [newSpotLocation, setNewSpotLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [filter, setFilter] = useState<AmenityType | 'ALL'>('ALL');

  // 1. Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  }, []);

  // 2. Fetch Amenities from Supabase
  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const formattedAmenities: Amenity[] = data.map((item: any) => ({
          id: item.id,
          type: item.type as AmenityType,
          name: item.name || '',
          description: item.description || '',
          location: {
            lat: item.latitude,
            lng: item.longitude
          },
          addedAt: new Date(item.created_at).getTime()
        }));
        setAmenities(formattedAmenities);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
      setDbError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    // When adding, reset filter to ALL so they can see what they are adding
    setFilter('ALL');
  };

  const handleMapClick = (location: Coordinates) => {
    if (isAdding) {
      setNewSpotLocation(location);
      setIsAdding(false); // Stop "selecting" mode, open form
    }
  };

  const handleSaveAmenity = async (data: Omit<Amenity, 'id' | 'addedAt'>) => {
    // 1. Optimistic UI Update (Show it immediately)
    const tempId = Math.random().toString(36).substr(2, 9);
    const newAmenity: Amenity = {
      ...data,
      id: tempId,
      addedAt: Date.now()
    };
    setAmenities(prev => [...prev, newAmenity]);
    setNewSpotLocation(null);

    // 2. Save to Supabase
    try {
      const { data: insertedData, error } = await supabase.from('amenities').insert([
        {
          type: data.type,
          name: data.name,
          description: data.description,
          latitude: data.location.lat,
          longitude: data.location.lng,
        }
      ]).select();

      if (error) {
        console.error("Error saving to DB:", error);
      } else if (insertedData && insertedData[0]) {
        // Update the temporary ID with the real DB ID
        setAmenities(prev => prev.map(a => 
          a.id === tempId ? { ...a, id: insertedData[0].id } : a
        ));
      }
    } catch (err) {
      console.error("System error saving:", err);
    }
  };

  const handleDeleteAmenity = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this spot?")) return;

    // 1. Optimistic UI Update
    setAmenities(prev => prev.filter(a => a.id !== id));

    // 2. Delete from Supabase
    try {
      const { error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting from DB:", error);
        // Revert if failed (optional, but good practice)
        fetchAmenities();
        alert("Failed to delete. Please try again.");
      }
    } catch (err) {
      console.error("System error deleting:", err);
    }
  };

  const handleCancelAdd = () => {
    setNewSpotLocation(null);
    setIsAdding(false);
  };

  // Filter amenities based on selection
  const filteredAmenities = filter === 'ALL' 
    ? amenities 
    : amenities.filter(a => a.type === filter);

  return (
    <div className="relative h-[100dvh] w-full bg-slate-100 flex flex-col md:flex-row overflow-hidden">
      
      {/* Main Map Area */}
      <div className="flex-1 relative h-full">
        <MapUI
          userLocation={userLocation}
          amenities={filteredAmenities}
          isAdding={isAdding}
          onMapClick={handleMapClick}
          onDelete={handleDeleteAmenity}
        />

        {/* Top Gradient Overlay for readability */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none z-[300]" />

        {/* Header / Brand */}
        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-slate-200 pr-6">
           <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
               <MapIcon size={18} />
             </div>
             SpotShare
           </h1>
           {isLoading && (
             <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 ml-10">
               <Loader2 size={10} className="animate-spin" /> Syncing...
             </div>
           )}
           {dbError && !isLoading && (
             <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1 ml-10">
               <AlertCircle size={10} /> Offline Mode
             </div>
           )}
        </div>

        {/* Filter Bar */}
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />

        {/* Adding Instruction Banner */}
        {isAdding && !newSpotLocation && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 w-max max-w-[90%] text-center">
            <p className="font-medium text-sm flex items-center justify-center gap-2">
              <Navigation className="animate-pulse flex-shrink-0" size={16} />
              Tap map to place pin
            </p>
            <button 
              onClick={() => setIsAdding(false)}
              className="absolute -right-2 -top-2 bg-white text-slate-900 rounded-full p-1 shadow-sm hover:bg-slate-200"
            >
              <span className="sr-only">Cancel</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-[1000]">
          <button
            onClick={handleStartAdd}
            disabled={isAdding || !!newSpotLocation}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg shadow-brand-500/30 text-white transition-transform active:scale-95 ${
               isAdding ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            <Plus size={20} />
            <span>Add Spot</span>
          </button>
        </div>
      </div>

      {/* Add Amenity Form Overlay */}
      {newSpotLocation && (
        <AddAmenityForm
          location={newSpotLocation}
          onSave={handleSaveAmenity}
          onCancel={handleCancelAdd}
        />
      )}

    </div>
  );
};

export default App;