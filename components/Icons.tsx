import React from 'react';
import { AmenityType } from '../types';

export const AmenityIcon: React.FC<{ type: AmenityType; className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case AmenityType.RESTROOM:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9 20v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5" />
          <path d="M9 4v2" />
          <path d="M15 4v2" />
          <circle cx="12" cy="7" r="4" />
          <line x1="12" y1="11" x2="12" y2="13" />
        </svg>
      );
    case AmenityType.WATER:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2c-3 4-7 6-7 11a7 7 0 0 0 14 0c0-5-4-7-7-11z" />
          <path d="M12 16v-4" />
        </svg>
      );
    case AmenityType.ATM:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case AmenityType.BIKE_RACK:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-9 3-2-3-2 3-2h5l3 2-3 2 3 2-3 9v3.5" />
        </svg>
      );
    case AmenityType.BENCH:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M15 15v-5l-4-4H7l-4 4v5" />
          <path d="M4 15h16" />
          <path d="M6 15v4" />
          <path d="M18 15v4" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};
