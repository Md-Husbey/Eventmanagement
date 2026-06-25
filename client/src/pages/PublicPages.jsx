import { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Star, Waves, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { useAuth } from '../App';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES_HOME = [
  { key: 'dj_party', label: 'DJ Party', emoji: '🎧' },
  { key: 'beach_party', label: 'Beach Party', emoji: '🏖️' },
  { key: 'food_festival', label: 'Food Festival', emoji: '🍜' },
  { key: 'music_concert', label: 'Music Concert', emoji: '🎵' },
  { key: 'wedding_event', label: 'Beach Wedding', emoji: '💍' },
  { key: 'cultural_program', label: 'Cultural Program', emoji: '🎭' },
  { key: 'tourism_festival', label: 'Tourism Festival', emoji: '🌊' },
  { key: 'new_year', label: 'New Year', emoji: '🎆' },
];

const CATEGORIES_ALL = [
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

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card group hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-ocean-500 overflow-hidden">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full text-white"><Waves size={48} className="opacity-50" /></div>
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
          <span className="font-bold text-primary-600">{event.basePrice > 0 ? `৳${event.basePrice}` : 'Free'}</span>
          <span className="text-xs text-gray-400">{event.organizer?.name}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/events/featured').then(({ data }) => setFeatured(data.events || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="text-white py-20 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#0a2a4a 0%,#0e4d7b 30%,#1a6ea8 55%,#2389c4 72%,#61b3d4 85%,#c8a86b 93%,#d4956a 100%)' }}>
        <div className="absolute pointer-events-none" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,220,100,0.55) 0%,rgba(255,160,50,0.18) 55%,transparent 75%)', animation: 'sunPulse 4s ease-in-out infinite' }} />
        {[{ top: '14%', left: '18%', delay: '0s', size: 18 }, { top: '10%', left: '26%', delay: '0.3s', size: 14 }, { top: '18%', left: '72%', delay: '0.6s', size: 16 }, { top: '12%', left: '80%', delay: '0.9s', size: 12 }].map((b, i) => (
          <svg key={i} className="absolute pointer-events-none opacity-60" style={{ top: b.top, left: b.left, width: b.size, animation: `seagull 3s ${b.delay} ease-in-out infinite` }} viewBox="0 0 40 20" fill="none">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
        ))}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none" style={{ height: 130 }}>
          <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" style={{ animation: 'wave1 7s linear infinite' }}>
            <path d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,130 L0,130 Z" fill="rgba(255,255,255,0.12)" />
          </svg>
          <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" style={{ animation: 'wave2 5s linear infinite' }}>
            <path d="M0,80 C200,30 400,110 600,70 C800,30 1000,100 1200,60 C1300,40 1380,80 1440,70 L1440,130 L0,130 Z" fill="rgba(255,255,255,0.09)" />
          </svg>
          <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" style={{ animation: 'wave3 9s linear infinite' }}>
            <path d="M0,100 C360,50 720,120 1080,70 C1260,50 1380,90 1440,80 L1440,130 L0,130 Z" fill="rgba(255,255,255,0.07)" />
          </svg>
          <div className="absolute bottom-0 left-0 w-full h-6" style={{ background: 'linear-gradient(180deg,rgba(200,168,107,0.5) 0%,rgba(212,149,106,0.7) 100%)' }} />
        </div>
        {[{ left: '8%', size: 6, delay: '0s', dur: '6s' }, { left: '20%', size: 4, delay: '1.5s', dur: '8s' }, { left: '50%', size: 8, delay: '0.8s', dur: '7s' }, { left: '70%', size: 5, delay: '2s', dur: '9s' }, { left: '88%', size: 6, delay: '0.3s', dur: '6.5s' }].map((b, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={{ bottom: 30, left: b.left, width: b.size, height: b.size, background: 'rgba(255,255,255,0.25)', animation: `bubble ${b.dur} ${b.delay} ease-in infinite` }} />
        ))}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-4" style={{ animation: 'heroBounceIn 0.8s ease both' }}>
            <Waves size={56} className="text-sand-300" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight" style={{ animation: 'heroBounceIn 0.8s 0.1s ease both' }}>
            SeaFest <span className="text-sand-300">BD</span>
          </h1>
          <p className="text-xl text-primary-200 mb-3" style={{ animation: 'heroBounceIn 0.8s 0.2s ease both' }}>Smart Tourism, Entertainment & Event Management</p>
          <p className="text-blue-200 mb-10 text-lg" style={{ animation: 'heroBounceIn 0.8s 0.3s ease both' }}>Cox's Bazar, Bangladesh</p>
          <p className="text-2xl font-light italic text-sand-200 mb-10" style={{ animation: 'heroBounceIn 0.8s 0.4s ease both' }}>Discover. Book. Celebrate.</p>
          <div className="flex max-w-xl mx-auto gap-2" style={{ animation: 'heroBounceIn 0.8s 0.5s ease both' }}>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sand-300" />
            </div>
            <Link to={`/events${searchQuery ? `?search=${searchQuery}` : ''}`}
              className="bg-sand-400 hover:bg-sand-300 text-primary-900 font-semibold px-6 py-3 rounded-xl transition-colors">Search</Link>
          </div>
        </div>
        <style>{`
          @keyframes heroBounceIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes sunPulse { 0%,100% { transform: translateX(-50%) scale(1); opacity: 0.9; } 50% { transform: translateX(-50%) scale(1.12); opacity: 1; } }
          @keyframes seagull { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes wave2 { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
          @keyframes wave3 { 0% { transform: translateX(0); } 100% { transform: translateX(-40%); } }
          @keyframes bubble { 0% { transform: translateY(0); opacity: 0.7; } 80% { transform: translateY(-180px); opacity: 0.2; } 100% { transform: translateY(-200px); opacity: 0; } }
        `}</style>
      </section>

      {/* Categories */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES_HOME.map(cat => (
              <Link key={cat.key} to={`/events?category=${cat.key}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors">
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

// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
export function EventsPage() {
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
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search events..." defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && setFilter('search', e.target.value)}
            className="input pl-9 py-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES_ALL.map(cat => (
            <button key={cat.key} onClick={() => setFilter('category', cat.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${category === cat.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
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

// ─── EVENT DETAIL PAGE ────────────────────────────────────────────────────────
export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => { setEvent(data.event); if (data.event.tickets?.length) setSelectedTicket(data.event.tickets[0].id); })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTicket) { toast.error('Select a ticket type'); return; }
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', { eventId: id, ticketId: selectedTicket, quantity });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/bookings/${data.booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl mb-6" />
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
  if (!event) return null;

  const avgRating = event.reviews?.length
    ? (event.reviews.reduce((s, r) => s + r.rating, 0) / event.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary-400 to-ocean-500">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-white"><Waves size={64} className="opacity-40" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <span className="badge bg-white/20 text-white border border-white/30 mb-2">
            {event.category?.replace(/_/g, ' ').toUpperCase()}
          </span>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Event Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="text-primary-500" size={18} />
                <span>{new Date(event.date).toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="text-primary-500" size={18} />
                <span>{new Date(event.date).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="text-primary-500" size={18} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="text-primary-500" size={18} />
                <span>{event.availableSeats} seats available</span>
              </div>
            </div>
            {event.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
              <span>Organized by</span>
              <span className="font-medium text-gray-800">{event.organizer?.name}</span>
            </div>
          </div>

          {event.reviews?.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-lg">Reviews</h2>
                {avgRating && (
                  <div className="flex items-center gap-1 text-sand-400">
                    <Star size={16} fill="currentColor" />
                    <span className="font-medium text-gray-700">{avgRating}</span>
                    <span className="text-gray-400 text-sm">({event.reviews.length})</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {event.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{review.user?.name}</span>
                      <div className="flex text-sand-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Book Tickets</h2>
          {event.tickets?.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets available</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {event.tickets?.map(ticket => (
                  <label key={ticket.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedTicket === ticket.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="ticket" value={ticket.id}
                        checked={selectedTicket === ticket.id}
                        onChange={() => setSelectedTicket(ticket.id)}
                        className="text-primary-600" />
                      <div>
                        <p className="font-medium text-sm">{ticket.type}</p>
                        <p className="text-xs text-gray-500">{ticket.quantity - ticket.sold} left</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary-600">৳{ticket.price}</span>
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input py-2">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {selectedTicket && (
                <div className="flex justify-between text-sm font-medium mb-4 p-3 bg-gray-50 rounded-lg">
                  <span>Total</span>
                  <span className="text-primary-600 text-base font-bold">
                    ৳{(event.tickets?.find(t => t.id === selectedTicket)?.price || 0) * quantity}
                  </span>
                </div>
              )}
              <button onClick={handleBook} disabled={booking || !selectedTicket} className="btn-primary w-full disabled:opacity-50">
                {booking ? 'Processing...' : 'Book Now'}
              </button>
              {!user && <p className="text-xs text-gray-500 text-center mt-2">Login required to book</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
