import axios from 'axios';
import { useState, useEffect } from 'react';

import { MapPin, Plus, Star, Award, Filter, Search, Navigation, Coffee, Zap, Users, Heart, Book, TrendingUp, X, Check } from 'lucide-react';

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
    { id: 'study', name: 'Study Spaces', icon: Book, color: 'bg-purple-500' },
    { id: 'food', name: 'Food & Drinks', icon: Coffee, color: 'bg-orange-500' },
    { id: 'wellness', name: 'Wellness', icon: Heart, color: 'bg-pink-500' },
    { id: 'tech', name: 'Tech/Charging', icon: Zap, color: 'bg-yellow-500' },
    { id: 'social', name: 'Social Spaces', icon: Users, color: 'bg-green-500' },
  ];

  const [amenities, setAmenities] = useState([
    {
      id: 1,
      name: 'Suzzallo Library Reading Room',
      category: 'study',
      location: { x: 45, y: 35 },
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
      location: { x: 55, y: 40 },
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
      location: { x: 60, y: 55 },
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
      location: { x: 50, y: 60 },
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
      location: { x: 40, y: 50 },
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
      location: { x: 35, y: 45 },
      rating: 4.4,
      verified: false,
      features: ['Couches', 'Microwave', 'Board Games', 'Casual Atmosphere'],
      aiSummary: 'Chill hangout spot. Great for taking breaks between classes. Sometimes has free food events. Community notices board is helpful.',
      reviews: 56,
      contributions: 9,
      hours: '7AM - 11PM',
      crowdLevel: 'moderate'
    },
  ]);

  const [newAmenity, setNewAmenity] = useState({
    name: '',
    category: 'study',
    features: '',
    description: ''
  });

  const filteredAmenities = amenities.filter(amenity => {
    const matchesCategory = selectedCategory === 'all' || amenity.category === selectedCategory;
    const matchesSearch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         amenity.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const showTempNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAddAmenity = () => {
    if (newAmenity.name && newAmenity.description) {
      const amenityToAdd = {
        id: amenities.length + 1,
        name: newAmenity.name,
        category: newAmenity.category,
        location: { x: 50 + Math.random() * 20 - 10, y: 50 + Math.random() * 20 - 10 },
        rating: 0,
        verified: false,
        features: newAmenity.features.split(',').map(f => f.trim()),
        aiSummary: `Recently added by the community. ${newAmenity.description}`,
        reviews: 0,
        contributions: 1,
        hours: 'Hours pending verification',
        crowdLevel: 'unknown'
      };

      setAmenities([...amenities, amenityToAdd]);
      setUserPoints(userPoints + 5);
      showTempNotification('🎉 +5 Campus Credits earned! Thank you for contributing!');
      setShowAddForm(false);
      setNewAmenity({ name: '', category: 'study', features: '', description: '' });
    }
  };

  const getCrowdColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <Navigation className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  Campus Compass
                </h1>
                <p className="text-xs text-gray-600">Community-Powered Amenities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-reward px-4 py-2 rounded-full flex items-center gap-2">
                <Award className="text-white" size={20} />
                <span className="font-bold text-white">{userPoints} Credits</span>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-hover"
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
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'map' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <MapPin size={18} />
                Map
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  view === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Filter size={18} />
                List
              </button>
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
        {view === 'map' ? (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="relative w-full h-[600px] bg-gradient-to-br from-green-100 to-blue-100 rounded-xl overflow-hidden">
              {/* Campus Map Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gray-400 rounded-lg"></div>
                <div className="absolute top-1/3 right-1/4 w-40 h-24 bg-gray-400 rounded-lg"></div>
                <div className="absolute bottom-1/4 left-1/3 w-36 h-28 bg-gray-400 rounded-lg"></div>
              </div>

              {/* Amenity Pins */}
              {filteredAmenities.map(amenity => {
                const category = categories.find(c => c.id === amenity.category);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => setSelectedAmenity(amenity)}
                    className="absolute transform -translate-x-1/2 -translate-y-full hover:scale-125 transition-transform"
                    style={{ left: `${amenity.location.x}%`, top: `${amenity.location.y}%` }}
                  >
                    <div className={`${category?.color} p-3 rounded-full shadow-lg`}>
                      <MapPin className="text-white" size={24} />
                    </div>
                    {amenity.verified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
                <div className="space-y-1">
                  {categories.slice(1).map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className={`${cat.color} w-3 h-3 rounded-full`}></div>
                      <span className="text-xs text-gray-600">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Amenity Details */}
            {selectedAmenity && (
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 relative">
                <button
                  onClick={() => setSelectedAmenity(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {selectedAmenity.name}
                      {selectedAmenity.verified && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Verified</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="font-semibold">{selectedAmenity.rating}</span>
                        <span>({selectedAmenity.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{selectedAmenity.contributions} contributions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-purple-600" />
                    <span className="font-semibold text-gray-700">AI Summary</span>
                  </div>
                  <p className="text-gray-700 bg-white rounded-lg p-3 italic">
                    "{selectedAmenity.aiSummary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenity.features.map((feature, idx) => (
                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Details</div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div>⏰ {selectedAmenity.hours}</div>
                      <div className="flex items-center gap-2">
                        <span>Current crowd:</span>
                        <span className={`font-semibold ${getCrowdColor(selectedAmenity.crowdLevel)}`}>
                          {selectedAmenity.crowdLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold shadow-hover">
                  Get Directions
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAmenities.map(amenity => {
              const category = categories.find(c => c.id === amenity.category);
              const Icon = category?.icon || MapPin;
              return (
                <div key={amenity.id} className="bg-white rounded-xl shadow-lg p-6 shadow-hover">
                  <div className="flex items-start gap-4">
                    <div className={`${category?.color} p-3 rounded-xl`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {amenity.name}
                            {amenity.verified && (
                              <Check size={16} className="text-blue-500" />
                            )}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="text-yellow-500 fill-yellow-500" size={14} />
                              <span>{amenity.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{amenity.reviews} reviews</span>
                            <span>•</span>
                            <span className={getCrowdColor(amenity.crowdLevel)}>
                              {amenity.crowdLevel} crowd
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3 italic">"{amenity.aiSummary}"</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {amenity.features.map((feature, idx) => (
                          <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-600">⏰ {amenity.hours}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Amenity Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Amenity</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amenity Name</label>
                <input
                  type="text"
                  value={newAmenity.name}
                  onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="e.g., Secret Study Nook in Allen Library"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={newAmenity.category}
                  onChange={(e) => setNewAmenity({...newAmenity, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  placeholder="e.g., Quiet, WiFi, Outlets, Great Lighting"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newAmenity.description}
                  onChange={(e) => setNewAmenity({...newAmenity, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Share what makes this spot special..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                  <Award size={18} />
                  <span className="font-semibold">Earn 5 Campus Credits for this contribution!</span>
                </div>
              </div>

              <button
                onClick={handleAddAmenity}
                className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold shadow-hover"
              >
                Submit Amenity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;