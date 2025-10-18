import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="font-bold text-lg">Campus Connect</NavLink>
        </div>
        <div className="flex items-center gap-4">
          <NavLink to="/" className={({isActive}) => isActive ? 'text-purple-600' : ''}>Home</NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? 'text-purple-600' : ''}>About</NavLink>
        </div>
      </div>
    </nav>
  );
}
