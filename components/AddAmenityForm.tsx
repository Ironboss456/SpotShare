import React, { useState } from 'react';
import { AmenityType, Coordinates, Amenity } from '../types';
import { AmenityIcon } from './Icons';
import { X, Check } from 'lucide-react';

interface AddAmenityFormProps {
  location: Coordinates;
  onSave: (amenity: Omit<Amenity, 'id' | 'addedAt'>) => void;
  onCancel: () => void;
}

const AddAmenityForm: React.FC<AddAmenityFormProps> = ({ location, onSave, onCancel }) => {
  const [type, setType] = useState<AmenityType>(AmenityType.RESTROOM);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      name: name || type, // Default name to type if empty
      description,
      location
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-40 md:w-96 md:bottom-auto md:top-4 md:left-4 md:rounded-2xl md:shadow-xl border border-slate-100 animate-in slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Add New Spot</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {Object.values(AmenityType).map((t) => (
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

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Name (Optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Central Park Restrooms"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any helpful details? (e.g. 'Requires code', 'Clean', 'Out of order')"
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
            Save Spot
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAmenityForm;
