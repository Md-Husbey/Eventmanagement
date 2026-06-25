import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Search, Filter, Waves } from 'lucide-react';
import api from '../../features/api';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'dj_party', label: 'DJ Party' },
  { key: 'beach_party', label: 'Beach Party' },
  { key: 'food_festival', label: 'Food Festival' },
  { key: 'music_concert', label: 'Music Concert' },
  { key: 'wedding_event', label: 'Wedding' },
  { key: 'cultural_program', label: 'Cultural' },
  { key: 'tourism_festival', label: 'Tourism' },
  { key: 'new_year', label: 'New Year' },
  { key: 'corporate_event', label: 'Corporate' },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    api.get('/events', { params: { category, search, page, limit: 12 } })
      .then(({ data }) => { setEvents(data.events); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Events</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search events..." defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && setFilter('search', e.target.value)}
            className="input pl-9 py-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onClick={() => setFilter('category', cat.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${category === cat.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Waves size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{total} events found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="card group hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-primary-400 to-ocean-500 overflow-hidden">
                  {event.coverImage ? (
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white"><Waves size={40} className="opacity-40" /></div>
                  )}
                  <span className="absolute top-3 left-3 badge bg-white/90 text-primary-700">
                    {event.category?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
                    <Calendar size={13} />
                    <span>{new Date(event.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <MapPin size={13} />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-primary-600">{event.basePrice > 0 ? `৳${event.basePrice}` : 'Free'}</span>
                    <span className="text-xs text-gray-400">{event.availableSeats} seats left</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {total > 12 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Previous</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
