import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg">Page not found.</p>
      <Link to="/" className="text-blue-600 underline">Go home</Link>
    </div>
  );
}
