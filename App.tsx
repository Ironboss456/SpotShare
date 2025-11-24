import React, { useState, useEffect } from 'react';
import MapUI from './components/MapUI';
import AddAmenityForm from './components/AddAmenityForm';
import FilterBar from './components/FilterBar';
import AuthUI from './components/AuthUI';
import GroupManager from './components/GroupManager';
import { Amenity, Coordinates, AmenityType, UserProfile, Group } from './types';
import { Plus, Map as MapIcon, Navigation, Loader2, AlertCircle, Menu } from 'lucide-react';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showGroups, setShowGroups] = useState(false);

  // App State
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | 'PUBLIC'>('PUBLIC');
  
  const [userLocation, setUserLocation] = useState<Coordinates>({ lat: 34.0522, lng: -118.2437 });
  const [isAdding, setIsAdding] = useState(false);
  const [newSpotLocation, setNewSpotLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [filter, setFilter] = useState<AmenityType | 'ALL'>('ALL');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if(session) setUser({ id: session.user.id, email: session.user.email });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if(session) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Get Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error(error)
      );
    }
  }, []);

  // Fetch Data when Session or Group Filter changes
  useEffect(() => {
    if (session) {
      fetchAmenities();
      fetchUserGroups();
    }
  }, [session, activeGroupId]);

  const fetchUserGroups = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('group_members')
      .select('groups(*)')
      .eq('user_id', user.id);
    
    if (data) {
      setUserGroups(data.map((d: any) => d.groups));
    }
  };

  const fetchAmenities = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('amenities').select('*');

      // Filtering logic
      if (activeGroupId === 'PUBLIC') {
        query = query.is('group_id', null);
      } else {
        query = query.eq('group_id', activeGroupId);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const formattedAmenities: Amenity[] = data.map((item: any) => ({
          id: item.id,
          type: item.type as AmenityType,
          name: item.name || '',
          description: item.description || '',
          location: { lat: item.latitude, lng: item.longitude },
          addedAt: new Date(item.created_at).getTime(),
          groupId: item.group_id,
          eventDate: item.event_date,
          creatorId: item.creator_id
        }));
        setAmenities(formattedAmenities);
      }
    } catch (err) {
      console.error(err);
      setDbError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAmenity = async (data: Partial<Amenity>) => {
    // Optimistic UI
    const tempId = Math.random().toString(36).substr(2, 9);
    const newAmenity: Amenity = {
      ...data,
      id: tempId,
      addedAt: Date.now(),
      type: data.type!,
      name: data.name!,
      description: data.description!,
      location: data.location!
    };
    setAmenities(prev => [...prev, newAmenity]);
    setNewSpotLocation(null);

    // DB Save
    try {
      await supabase.from('amenities').insert([{
        type: data.type,
        name: data.name,
        description: data.description,
        latitude: data.location!.lat,
        longitude: data.location!.lng,
        group_id: data.groupId,
        event_date: data.eventDate,
        creator_id: user?.id
      }]);
      fetchAmenities(); // Refresh to get real ID
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAmenity = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    setAmenities(prev => prev.filter(a => a.id !== id));
    await supabase.from('amenities').delete().eq('id', id);
  };

  const filteredAmenities = filter === 'ALL' 
    ? amenities 
    : amenities.filter(a => a.type === filter);

  if (!session) {
    return <AuthUI onAuthSuccess={() => {}} />;
  }

  return (
    <div className="relative h-[100dvh] w-full bg-slate-100 flex overflow-hidden">
      
      {/* Sidebar / Groups Panel */}
      {showGroups && user && (
        <GroupManager 
          user={user}
          activeGroupId={activeGroupId}
          onGroupSelect={(gid) => {
            setActiveGroupId(gid);
            setShowGroups(false); // On mobile maybe close it?
          }}
          onClose={() => setShowGroups(false)}
        />
      )}

      {/* Main Map Area */}
      <div className="flex-1 relative h-full w-full">
        <MapUI
          userLocation={userLocation}
          amenities={filteredAmenities}
          isAdding={isAdding}
          onMapClick={(loc) => { if (isAdding) { setNewSpotLocation(loc); setIsAdding(false); }}}
          onDelete={handleDeleteAmenity}
        />

        {/* Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none z-[300]" />

        {/* Header */}
        <div className="absolute top-4 left-4 z-[400] flex gap-2">
          <button 
            onClick={() => setShowGroups(true)} 
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Menu size={20} />
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-slate-200 pr-6 flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
               <MapIcon size={18} />
             </div>
             <div>
               <h1 className="font-bold text-sm text-slate-800 leading-tight">SpotShare</h1>
               <p className="text-[10px] text-slate-500 font-medium">
                 {activeGroupId === 'PUBLIC' ? 'Public Map' : userGroups.find(g=>g.id === activeGroupId)?.name || 'Group Map'}
               </p>
             </div>
          </div>
        </div>

        <FilterBar currentFilter={filter} onFilterChange={setFilter} />

        {isAdding && !newSpotLocation && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-lg">
            <p className="font-medium text-sm flex items-center gap-2">
              <Navigation className="animate-pulse" size={16} /> Tap map to place
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={() => { setIsAdding(true); setFilter('ALL'); }}
            disabled={isAdding}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl text-white transition-all active:scale-95 ${
               isAdding ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            <Plus size={20} /> {activeGroupId === 'PUBLIC' ? 'Add Public Spot' : 'Add to Group'}
          </button>
        </div>
      </div>

      {newSpotLocation && user && (
        <AddAmenityForm
          location={newSpotLocation}
          onSave={handleSaveAmenity}
          onCancel={() => { setNewSpotLocation(null); setIsAdding(false); }}
          userGroups={userGroups}
          currentUserId={user.id}
        />
      )}

    </div>
  );
};

export default App;