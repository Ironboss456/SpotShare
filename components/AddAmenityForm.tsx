import React, { useState } from 'react';
import { AmenityType, Coordinates, Amenity, Group } from '../types';
import { AmenityIcon } from './Icons';
import { X, Check, Calendar, Users, Globe } from 'lucide-react';

interface AddAmenityFormProps {
  location: Coordinates;
  onSave: (amenity: Partial<Amenity>) => void;
  onCancel: () => void;
  userGroups: Group[];
  currentUserId: string;
}

const AddAmenityForm: React.FC<AddAmenityFormProps> = ({ location, onSave, onCancel, userGroups, currentUserId }) => {
  const [type, setType] = useState<AmenityType>(AmenityType.RESTROOM);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Group logic
  const [selectedGroupId, setSelectedGroupId] = useState<string>('PUBLIC'); // 'PUBLIC' or UUID
  const [eventDate, setEventDate] = useState('');

  const selectedGroup = userGroups.find(g => g.id === selectedGroupId);
  const isCreator = selectedGroup?.creator_id === currentUserId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalType = eventDate ? AmenityType.EVENT : type;

    onSave({
      type: finalType,
      name: name || finalType,
      description,
      location,
      groupId: selectedGroupId === 'PUBLIC' ? undefined : selectedGroupId,
      eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      creatorId: currentUserId
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-[1100] md:w-96 md:bottom-auto md:top-4 md:left-4 md:rounded-2xl md:shadow-xl border border-slate-100 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Add to Map</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Visibility Selector */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label className="block text-xs font-semibold text-slate-500 mb-2">Who can see this?</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => { setSelectedGroupId('PUBLIC'); setEventDate(''); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap ${
                selectedGroupId === 'PUBLIC' ? 'bg-white border-brand-500 text-brand-700 shadow-sm' : 'border-transparent text-slate-500'
              }`}
            >
              <Globe size={14} /> Public
            </button>
            {userGroups.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGroupId(g.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap ${
                  selectedGroupId === g.id ? 'bg-white border-brand-500 text-brand-700 shadow-sm' : 'border-transparent text-slate-500'
                }`}
              >
                <Users size={14} /> {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Event Logic: Only if inside a group and user is creator */}
        {selectedGroupId !== 'PUBLIC' && isCreator && (
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <label className="block text-xs font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              <Calendar size={14} /> Schedule Group Event (Creator Only)
            </label>
            <input 
              type="datetime-local" 
              className="w-full text-xs p-2 rounded border border-indigo-200"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
            />
          </div>
        )}

        {/* Standard Type Selection (Hidden if Event selected) */}
        {!eventDate && (
          <div className="grid grid-cols-4 gap-2">
            {Object.values(AmenityType).filter(t => t !== AmenityType.EVENT).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all border ${
                  type === t
                    ? 'bg-brand-50 border-brand-200 text-brand-700 ring-2 ring-brand-500/20'
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <AmenityIcon type={t} className="w-5 h-5 mb-1" />
                <span className="truncate w-full text-center text-[10px]">{t}</span>
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={eventDate ? "Event Name" : "e.g. Central Park Restrooms"}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any helpful details?"
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <div className="pt-2">
           <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-500/20"
          >
            <Check size={18} />
            {eventDate ? "Schedule Event" : "Save Spot"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAmenityForm;