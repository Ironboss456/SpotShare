import React from 'react';
import { AmenityType } from '../types';
import { AmenityIcon } from './Icons';

interface FilterBarProps {
  currentFilter: AmenityType | 'ALL';
  onFilterChange: (type: AmenityType | 'ALL') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="absolute top-20 left-0 w-full z-[400] px-4 overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
      <div className="flex gap-2 w-max px-1">
        <button
          onClick={() => onFilterChange('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-md border transition-all ${
            currentFilter === 'ALL'
              ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-500/30'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Spots
        </button>
        {Object.values(AmenityType).map((type) => (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-md border transition-all whitespace-nowrap ${
              currentFilter === type
                ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-500/30'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AmenityIcon type={type} className="w-4 h-4" />
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;