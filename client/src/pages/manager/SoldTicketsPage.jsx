import { useState, useEffect } from 'react';
import { Search, Ticket, Calendar, MapPin, User, Hash } from 'lucide-react';
import api from '../../features/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded:  'bg-gray-100 text-gray-500',
  attended:  'bg-blue-100 text-blue-700',
};

export default function SoldTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterEvent) params.eventId = filterEvent;
    if (filterStatus) params.status = filterStatus;
    api.get('/bookings/manager/sold', { params })
      .then(({ data }) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/events/my').then(({ data }) => setEvents(data.events));
  }, []);

  useEffect(() => { load(); }, [filterEvent, filterStatus]);

  const filtered = bookings.filter(b =>
    !search ||
    b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sold Tickets</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or booking ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        <select
          value={filterEvent}
          onChange={e => setFilterEvent(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="attended">Attended</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Ticket size={44} className="mx-auto mb-3 opacity-30" />
          <p>No sold tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-4">

                {/* Left: booking ref + status */}
                <div className="shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash size={13} className="text-gray-400" />
                    <span className="font-mono text-xs text-gray-600 font-semibold">{b.bookingRef}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-500'}`}>
                    {b.status?.toUpperCase()}
                  </span>
                </div>

                {/* Middle: event + ticket */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-gray-900 truncate">{b.event?.title}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(b.event?.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />{b.event?.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket size={12} />{b.ticket?.type} × {b.quantity}
                    </span>
                  </div>
                </div>

                {/* Right: buyer + amount */}
                <div className="text-right shrink-0 space-y-1">
                  <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                    <User size={13} className="text-gray-400" />
                    <span className="font-medium">{b.user?.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{b.user?.email}</p>
                  <p className="text-base font-bold text-blue-600">৳{Number(b.totalAmount).toLocaleString()}</p>
                  {b.payment?.method && (
                    <p className="text-xs text-gray-400 capitalize">{b.payment.method}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
