import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search, Star, Waves } from 'lucide-react';
import api from '../../features/api';

const CATEGORIES = [
  { key: 'dj_party', label: 'DJ Party', emoji: '🎧' },
  { key: 'beach_party', label: 'Beach Party', emoji: '🏖️' },
  { key: 'food_festival', label: 'Food Festival', emoji: '🍜' },
  { key: 'music_concert', label: 'Music Concert', emoji: '🎵' },
  { key: 'wedding_event', label: 'Beach Wedding', emoji: '💍' },
  { key: 'cultural_program', label: 'Cultural Program', emoji: '🎭' },
  { key: 'tourism_festival', label: 'Tourism Festival', emoji: '🌊' },
  { key: 'new_year', label: 'New Year', emoji: '🎆' },
];

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card group hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-ocean-500 overflow-hidden">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <Waves size={48} className="opacity-50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/90 text-primary-700">{event.category?.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
          <Calendar size={14} />
          <span>{new Date(event.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
          <MapPin size={14} />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-primary-600">
            {event.basePrice > 0 ? `৳${event.basePrice}` : 'Free'}
          </span>
          <span className="text-xs text-gray-400">{event.organizer?.name}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/events/featured').then(({ data }) => setFeatured(data.events || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-pattern text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Waves size={56} className="text-sand-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            SeaFest <span className="text-sand-300">BD</span>
          </h1>
          <p className="text-xl text-primary-200 mb-3">Smart Tourism, Entertainment & Event Management</p>
          <p className="text-primary-300 mb-10 text-lg">Cox's Bazar, Bangladesh</p>
          <p className="text-2xl font-light italic text-sand-200 mb-10">Discover. Book. Celebrate.</p>

          {/* Search */}
          <div className="flex max-w-xl mx-auto gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sand-300"
              />
            </div>
            <Link to={`/events${searchQuery ? `?search=${searchQuery}` : ''}`}
              className="bg-sand-400 hover:bg-sand-300 text-primary-900 font-semibold px-6 py-3 rounded-xl transition-colors">
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/events?category=${cat.key}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors group">
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-sand-400" size={24} /> Featured Events
              </h2>
              <Link to="/events" className="text-primary-600 font-medium hover:underline">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-hero-pattern py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Are You an Event Organizer?</h2>
        <p className="text-primary-200 mb-8 max-w-lg mx-auto">Join SeaFest BD and bring your events to thousands of tourists in Cox's Bazar.</p>
        <Link to="/become-organizer" className="bg-sand-400 hover:bg-sand-300 text-primary-900 font-bold px-8 py-3 rounded-xl transition-colors">
          Become an Organizer
        </Link>
      </section>
    </div>
  );
}
