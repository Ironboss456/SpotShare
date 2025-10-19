import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Star, Award, Filter, Search, Coffee, Zap, Users, Heart, Book, TrendingUp, X, Check } from 'lucide-react';
import RealMap from './components/RealMap';

const App = () => {
  const [view, setView] = useState('map');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [userPoints, setUserPoints] = useState(45);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: MapPin, color: 'bg-blue-500' },
    { id: 'events', name: 'Events', icon: Star, color: 'bg-purple-500' },
    { id: 'water', name: 'Water Fountains', icon: Coffee, color: 'bg-blue-400' },
    { id: 'restrooms', name: 'Restrooms', icon: Users, color: 'bg-gray-400' },
    { id: 'atms', name: 'ATMs', icon: TrendingUp, color: 'bg-yellow-400' },
    { id: 'avoid', name: 'Areas to Avoid', icon: Zap, color: 'bg-red-400' },
    { id: 'bikes', name: 'Bike Racks', icon: MapPin, color: 'bg-green-500' },
  ];

  // start empty and load from backend; fallback to sample data if backend isn't available
  const [amenities, setAmenities] = useState([]);

  const sampleAmenities = [
    {
      id: 1,
      name: 'Suzzallo Library Reading Room',
      category: 'study',
      location: { lat: 47.6564, lng: -122.3086 },
      rating: 4.8,
      verified: true,
      features: ['Quiet', 'WiFi', 'Beautiful Architecture', 'Open Late'],
      aiSummary: 'Students love the ambiance here. Usually quiet in afternoons. Gets busy during finals week. Best for focused work.',
      reviews: 127,
      contributions: 23,
      hours: '7AM - 2AM',
      crowdLevel: 'moderate'
    },
    {
      id: 2,
      name: 'Odegaard Maker Space',
      category: 'tech',
      location: { lat: 47.6566, lng: -122.3100 },
      rating: 4.6,
      verified: true,
      features: ['3D Printing', 'Charging Stations', 'Collaboration Space', 'Tech Support'],
      aiSummary: 'Great for group projects. Equipment usually available mornings. Staff very helpful. Book equipment in advance for best results.',
      reviews: 89,
      contributions: 15,
      hours: '9AM - 9PM',
      crowdLevel: 'low'
    },
    {
      id: 3,
      name: 'HUB Wellness Room',
      category: 'wellness',
      location: { lat: 47.6553, lng: -122.3045 },
      rating: 4.9,
      verified: true,
      features: ['Private', 'Meditation Space', 'Gender-Neutral', 'Accessible'],
      aiSummary: 'Peaceful sanctuary on campus. Students report feeling recharged. Usually available, but check during peak hours. Great for mental health breaks.',
      reviews: 64,
      contributions: 12,
      hours: '8AM - 8PM',
      crowdLevel: 'low'
    },
    {
      id: 4,
      name: 'Local Point Cafe',
      category: 'food',
      location: { lat: 47.6560, lng: -122.3120 },
      rating: 4.5,
      verified: true,
      features: ['Coffee', 'Study-Friendly', 'Outlets', 'Free WiFi'],
      aiSummary: 'Popular study spot with good coffee. Can get crowded 10AM-2PM. Great breakfast pastries. Friendly staff, reasonable noise level.',
      reviews: 203,
      contributions: 34,
      hours: '7AM - 7PM',
      crowdLevel: 'high'
    },
    {
      id: 5,
      name: 'Quad Charging Stations',
      category: 'tech',
      location: { lat: 47.6570, lng: -122.3070 },
      rating: 4.3,
      verified: true,
      features: ['USB-C', 'USB-A', 'Wireless Charging', 'Outdoor Seating'],
      aiSummary: 'Convenient outdoor charging. Weather dependent. Students recommend bringing your own cable. Nice spot between classes.',
      reviews: 45,
      contributions: 8,
      hours: '24/7',
      crowdLevel: 'moderate'
    },
    {
      id: 6,
      name: 'Student Lounge - Anderson Hall',
      category: 'social',
      location: { lat: 47.6548, lng: -122.3095 },
      rating: 4.4,
      verified: false,
      features: ['Couches', 'Microwave', 'Board Games', 'Casual Atmosphere'],
      aiSummary: 'Chill hangout spot. Great for taking breaks between classes. Sometimes has free food events. Community notices board is helpful.',
      reviews: 56,
      contributions: 9,
      hours: '7AM - 11PM',
      crowdLevel: 'moderate'
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/amenities');
        const json = await res.json();
        // handle both array response (from router) or wrapped response
        const raw = Array.isArray(json) ? json : json.data ? json.data : sampleAmenities;
        const normalized = (raw || []).map(a => {
          // normalize location: backend stores { x, y } while frontend expects { lat, lng }
          let location = null;
          if (a && a.location && typeof a.location === 'object') {
            const loc = a.location;
            if (loc.lat != null && loc.lng != null) location = { lat: Number(loc.lat), lng: Number(loc.lng) };
            else if (loc.x != null && loc.y != null) location = { lat: Number(loc.x), lng: Number(loc.y) };
          }
          return {
            ...a,
            location,
            features: Array.isArray(a.features) ? a.features : [],
            reviews: a.reviews ?? 0,
            contributions: a.contributions ?? 0,
            rating: a.rating ?? 0,
            aiSummary: a.aiSummary ?? '',
          };
        });
        setAmenities(normalized);
      } catch (e) {
        setAmenities(sampleAmenities);
      }
    };
    load();
  }, []);

  // load events from backend
  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/events');
      const json = await res.json();
      const raw = json.data || json;
      const normalized = (raw || []).map(ev => {
        const loc = ev.location;
        if (typeof loc === 'string') {
          return { ...ev, location: null, rawLocation: loc };
        }
        if (loc && typeof loc === 'object') {
          const location = loc.lat != null ? { lat: loc.lat, lng: loc.lng } : loc.x != null ? { lat: loc.x, lng: loc.y } : null;
          return { ...ev, location, rawLocation: typeof loc === 'string' ? loc : undefined };
        }
        return { ...ev, location: null };
      });
      setEvents(normalized);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const [events, setEvents] = useState([]);
  const [isEventMode, setIsEventMode] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: '', category: 'events', features: '', description: '', location: null });

  const filteredAmenities = amenities.filter(amenity => {
    const matchesCategory = selectedCategory === 'all' || amenity.category === selectedCategory;
    const matchesSearch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (amenity.features || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // filter events by selected category as well (events created by users can have a category)
  const filteredEvents = events.filter(ev => {
    if (!ev) return false;
    if (selectedCategory === 'all') return true;
    // some legacy events may not have category — treat them as non-matching unless 'all' is selected
    return ev.category === selectedCategory;
  });

  const showTempNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddAmenity = () => {
    if (newAmenity.name && newAmenity.description) {
      (async () => {
        try {
          const loc = newAmenity.location || { lat: 47.6553 + (Math.random() * 0.004 - 0.002), lng: -122.3035 + (Math.random() * 0.004 - 0.002) };
          // backend expects { x, y } for location in this project
          const payload = {
            name: newAmenity.name,
            category: newAmenity.category,
            features: newAmenity.features.split(',').map(f => f.trim()),
            aiSummary: `Recently added by the community. ${newAmenity.description}`,
            hours: 'Hours pending verification',
            crowdLevel: 'unknown',
            rating: 0,
            verified: false,
            // map lat/lng -> x/y to match backend schema
            location: { x: loc.lat, y: loc.lng },
          };

          const res = await fetch('http://localhost:5001/api/amenities/public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          const created = json.data || json; // handle both shapes
          // normalize location back to {lat,lng} for frontend and ensure optional fields exist
          const normalized = {
            ...created,
            location: created.location ? { lat: created.location.x ?? created.location.lat, lng: created.location.y ?? created.location.lng } : loc,
            features: Array.isArray(created.features) ? created.features : [],
            reviews: created.reviews ?? 0,
            contributions: created.contributions ?? 0,
            rating: created.rating ?? 0,
            aiSummary: created.aiSummary ?? `Recently added by the community. ${newAmenity.description}`,
          };

          setAmenities(prev => [...prev, normalized]);
          setUserPoints(prev => prev + 5);
          showTempNotification('🎉 +5 Campus Credits earned! Thank you for contributing!');
          setShowAddForm(false);
          setNewAmenity({ name: '', category: 'study', features: '', description: '' });
        } catch (err) {
          console.error('Failed to save amenity', err);
          showTempNotification('⚠️ Failed to save. Showing locally only.');
          // fallback to local add
          const amenityToAdd = {
            id: amenities.length + 1,
            name: newAmenity.name,
            category: newAmenity.category,
            location: newAmenity.location || { lat: 47.6553 + (Math.random() * 0.004 - 0.002), lng: -122.3035 + (Math.random() * 0.004 - 0.002) },
            rating: 0,
            verified: false,
            features: newAmenity.features.split(',').map(f => f.trim()),
            aiSummary: `Recently added by the community. ${newAmenity.description}`,
            reviews: 0,
            contributions: 1,
            hours: 'Hours pending verification',
            crowdLevel: 'unknown'
          };
          setAmenities(prev => [...prev, amenityToAdd]);
          setUserPoints(prev => prev + 5);
          setShowAddForm(false);
          setNewAmenity({ name: '', category: 'study', features: '', description: '' });
        }
      })();
    }
  };

  const handleEventSubmit = (eventPayload) => {
    (async () => {
      try {
        const res = await fetch('http://localhost:5001/api/events/public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventPayload),
        });
        const json = await res.json();
        if (json.data) {
          const ev = json.data;
          const loc = ev.location || {};
          const location = loc.lat != null ? { lat: loc.lat, lng: loc.lng } : loc.x != null ? { lat: loc.x, lng: loc.y } : loc;
          // refetch events so backend state is authoritative, then switch category filter so it becomes visible
          await fetchEvents();
          setSelectedCategory(ev.category || 'events');
          setUserPoints(prev => prev + 10);
          showTempNotification('🎉 +10 Campus Credits earned! Event added.');
         } else {
           showTempNotification('⚠️ Failed to add event. Please try again.');
         }
       } catch (err) {
         console.error('Failed to save event', err);
         showTempNotification('⚠️ Failed to save event. Showing locally only.');
         // fallback to local add
         const eventToAdd = {
           id: events.length + 1,
           title: eventPayload.title,
           description: eventPayload.description,
           location: eventPayload.location,
           category: eventPayload.category || 'events',
           createdAt: new Date().toISOString(),
         };
         setEvents(prev => [...prev, eventToAdd]);
         setSelectedCategory(eventToAdd.category);
         setUserPoints(prev => prev + 10);
       }
     })();
     setShowAddForm(false);
     setNewAmenity({ name: '', category: 'study', features: '', description: '' });
   };

  // Persist events by saving them as amenities (uses amenities collection/endpoint)
  const handleEventAsAmenity = () => {
    if (!newAmenity.name) return;
    (async () => {
      try {
        const loc = newAmenity.location || { lat: 47.6553 + (Math.random() * 0.004 - 0.002), lng: -122.3035 + (Math.random() * 0.004 - 0.002) };
        const payload = {
          name: newAmenity.name,
          category: newAmenity.category || 'events',
          features: newAmenity.features ? newAmenity.features.split(',').map(f => f.trim()).filter(Boolean) : [],
          aiSummary: newAmenity.description || '',
          hours: 'TBD',
          crowdLevel: 'unknown',
          rating: 0,
          verified: false,
          location: { x: loc.lat, y: loc.lng },
        };

        const res = await fetch('http://localhost:5001/api/amenities/public', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        const created = json.data || json;
        const normalized = {
          ...created,
          location: created.location ? { lat: created.location.x ?? created.location.lat, lng: created.location.y ?? created.location.lng } : loc,
          features: Array.isArray(created.features) ? created.features : [],
          reviews: created.reviews ?? 0,
          contributions: created.contributions ?? 0,
          rating: created.rating ?? 0,
          aiSummary: created.aiSummary ?? newAmenity.description ?? '',
        };

        setAmenities(prev => [...prev, normalized]);
        setUserPoints(prev => prev + 10);
        showTempNotification('🎉 +10 Campus Credits earned! Event added.');
        setShowAddForm(false);
        setNewAmenity({ name: '', category: 'study', features: '', description: '' });
      } catch (err) {
        console.error('Failed to save event as amenity', err);
        showTempNotification('⚠️ Failed to save event. Showing locally only.');
        const amenityToAdd = {
          id: amenities.length + 1,
          name: newAmenity.name,
          category: newAmenity.category || 'events',
          location: newAmenity.location || { lat: 47.6553 + (Math.random() * 0.004 - 0.002), lng: -122.3035 + (Math.random() * 0.004 - 0.002) },
          rating: 0,
          verified: false,
          features: newAmenity.features ? newAmenity.features.split(',').map(f => f.trim()).filter(Boolean) : [],
          aiSummary: newAmenity.description || '',
          reviews: 0,
          contributions: 1,
          hours: 'TBD',
          crowdLevel: 'unknown'
        };
        setAmenities(prev => [...prev, amenityToAdd]);
        setUserPoints(prev => prev + 10);
        setShowAddForm(false);
        setNewAmenity({ name: '', category: 'study', features: '', description: '' });
      }
    })();
  };

  const getCrowdColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleDeleteEvent = (id) => {
    setEvents(prev => prev.filter(e => (e._id || e.id) !== id));
  };

  const handleDeleteAmenity = (id) => {
    setAmenities(prev => prev.filter(a => (a._id || a.id) !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  SpotShare
                </h1>
                <p className="text-xs text-gray-600">Community-Powered Amenities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-reward px-4 py-2 rounded-full flex items-center gap-2">
                <Award className="text-white" size={20} />
                <span className="font-bold text-white">{userPoints} Credits</span>
              </div>
              <button
                onClick={() => {
                  alert("📍 Click a location on the map to add a new spot!");
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-hover"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Spot</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search amenities, features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-lg flex items-center gap-2 bg-purple-600 text-white">
                <MapPin size={18} />
                <span className="font-medium">Map</span>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? `${cat.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {notificationMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div>
          <RealMap
            amenities={filteredAmenities}
            categories={categories}
            events={filteredEvents}
            onAmenityClick={setSelectedAmenity}
            onEventClick={(ev) => setSelectedAmenity(ev)}
            onDeleteEvent={handleDeleteEvent}
            onDeleteAmenity={handleDeleteAmenity}
            selectedAmenity={selectedAmenity}
            onAddLocation={(coords) => {
              // pre-fill new event location and open add modal
              setNewAmenity({ ...newAmenity, location: coords, category: newAmenity?.category || 'events' });
              setIsEventMode(true);
              setShowAddForm(true);
            }}
            onCreateEvent={handleEventSubmit}
          />
        </div>
      </main>

      {/* Add Amenity / Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Removed top radio selector — creation type is chosen via the Category/Type controls below */}

              {isEventMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
                    <input
                      type="text"
                      value={newAmenity.name}
                      onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      placeholder="e.g., Campus Picnic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newAmenity.description}
                      onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      rows={3}
                      placeholder="Event details..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Traits (comma-separated)</label>
                    <input
                      type="text"
                      value={newAmenity.features}
                      onChange={(e) => setNewAmenity({...newAmenity, features: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      placeholder="e.g., Outdoor, Family-friendly, Free Snacks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={newAmenity.category || 'events'}
                      onChange={(e) => setNewAmenity({...newAmenity, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenity Name</label>
                    <input
                      type="text"
                      value={newAmenity.name}
                      onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      placeholder="e.g., Secret Study Nook in Allen Library"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={newAmenity.category}
                      onChange={(e) => setNewAmenity({...newAmenity, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Features (comma-separated)</label>
                    <input
                      type="text"
                      value={newAmenity.features}
                      onChange={(e) => setNewAmenity({...newAmenity, features: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      placeholder="e.g., Quiet, WiFi, Outlets, Great Lighting"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newAmenity.description}
                      onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none"
                      rows={3}
                      placeholder="Share what makes this spot special..."
                    />
                  </div>
                </>
              )}

              {newAmenity.location && (
                <div className="text-sm text-gray-600">
                  📍 Location: {newAmenity.location.lat.toFixed(5)}, {newAmenity.location.lng.toFixed(5)}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <Award size={18} />
                  <span className="font-semibold">Earn 5 Campus Credits for this contribution!</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isEventMode) {
                      // save events into the amenities collection so they persist
                      handleEventAsAmenity();
                    } else {
                       handleAddAmenity();
                     }
                   }}
                   className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold shadow-hover"
                 >
                  {isEventMode ? 'Submit Event' : 'Submit Amenity'}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white border border-gray-300 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;