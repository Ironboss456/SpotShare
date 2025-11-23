import React, { useState } from 'react';
import { searchAmenities } from '../services/geminiService';
import { AIChatMessage, Coordinates } from '../types';
import { Loader2, Search, MapPin, ExternalLink } from 'lucide-react';

interface AISearchProps {
  userLocation: Coordinates;
  onClose: () => void;
}

const AISearch: React.FC<AISearchProps> = ({ userLocation, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you find amenities nearby using Google Maps data. What are you looking for?' }
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: AIChatMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setQuery('');

    const response = await searchAmenities(userMsg.text, userLocation.lat, userLocation.lng);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col md:w-96 md:right-0 md:left-auto md:border-l border-slate-200 shadow-xl transition-transform animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-brand-100 text-brand-600 p-1.5 rounded-lg">
            <Search size={18} />
          </span>
          AI Assistant
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
            {/* Sources / Grounding */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 w-[85%] bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin size={12} /> Found Places:
                </p>
                <div className="space-y-2">
                  {msg.sources.map((source, sIdx) => (
                    <a
                      key={sIdx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs bg-slate-50 hover:bg-slate-100 p-2 rounded transition-colors text-brand-600 truncate flex items-center justify-between"
                    >
                      <span className="truncate">{source.title}</span>
                      <ExternalLink size={10} className="ml-2 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
              <Loader2 className="animate-spin text-slate-400" size={16} />
              <span className="text-xs text-slate-500">Searching nearby...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find coffee, parking..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Search size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AISearch;
