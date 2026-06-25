import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Plus, Ticket, TrendingUp, Waves, Edit2, Trash2, ScanLine, CheckCircle, XCircle, Search, User, Hash, MapPin, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../App';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  suspended: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-500',
  attended: 'bg-blue-100 text-blue-700',
};

const EVENT_CATEGORIES = [
  { value: 'dj_party', label: 'DJ Party' },
  { value: 'beach_party', label: 'Beach Party' },
  { value: 'food_festival', label: 'Food Festival' },
  { value: 'music_concert', label: 'Music Concert' },
  { value: 'wedding_event', label: 'Wedding Event' },
  { value: 'cultural_program', label: 'Cultural Program' },
  { value: 'tourism_festival', label: 'Tourism Festival' },
  { value: 'new_year', label: 'New Year Celebration' },
  { value: 'corporate_event', label: 'Corporate Event' },
  { value: 'hotel_event', label: 'Hotel Event' },
];

// ─── MANAGER DASHBOARD ────────────────────────────────────────────────────────
export function ManagerDashboardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/my').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending: events.filter(e => e.status === 'pending').length,
    totalTickets: events.reduce((s, e) => s + (e.tickets?.reduce((ts, t) => ts + t.sold, 0) || 0), 0),
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <Link to="/manager/events/create" className="btn-primary flex items-center gap-2"><Plus size={18} /> Create Event</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: stats.total, icon: Calendar, color: 'bg-primary-500' },
          { label: 'Live Events', value: stats.approved, icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Pending Review', value: stats.pending, icon: Calendar, color: 'bg-yellow-500' },
          { label: 'Tickets Sold', value: stats.totalTickets, icon: Ticket, color: 'bg-ocean-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Events</h2>
          <Link to="/manager/events" className="text-primary-600 text-sm hover:underline">View All</Link>
        </div>
        {loading ? <p className="p-4 text-gray-400 text-sm">Loading...</p> : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">No events yet</p>
            <Link to="/manager/events/create" className="btn-primary text-sm">Create First Event</Link>
          </div>
        ) : (
          <div className="divide-y">
            {events.slice(0, 5).map(ev => (
              <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">{ev.title}</p>
                  <p className="text-sm text-gray-500">{new Date(ev.date).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MANAGER EVENTS PAGE ──────────────────────────────────────────────────────
export function ManagerEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = () => {
    setLoading(true);
    api.get('/events/my').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Link to="/manager/events/create" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Event</Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Waves size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events yet</p>
          <Link to="/manager/events/create" className="btn-primary mt-4 inline-block">Create Your First Event</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="card p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-400 to-ocean-500 flex-shrink-0 overflow-hidden">
                {ev.coverImage ? <img src={ev.coverImage} alt="" className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full"><Waves size={24} className="text-white opacity-60" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{ev.title}</h3>
                <p className="text-sm text-gray-500">{new Date(ev.date).toLocaleDateString()} · {ev.location}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ev.tickets?.reduce((s, t) => s + t.sold, 0) || 0} tickets sold</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`badge ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                  <button onClick={() => deleteEvent(ev.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CREATE EVENT PAGE ────────────────────────────────────────────────────────
export function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { tickets: [{ type: 'General', price: '', quantity: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'tickets' });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await api.post('/events', {
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        endDate: data.endDate,
        location: data.location,
        totalCapacity: data.totalCapacity,
        availableSeats: data.totalCapacity,
        basePrice: data.tickets[0]?.price || 0,
      });
      await Promise.all(data.tickets.map(t =>
        api.post('/events/tickets', { ...t, eventId: res.event.id }).catch(() => {})
      ));
      toast.success('Event created! Awaiting admin approval.');
      navigate('/manager/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input className="input" {...register('title', { required: 'Title required' })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="input" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select className="input" {...register('category', { required: true })}>
                {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" className="input" {...register('totalCapacity')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input className="input" placeholder="Cox's Bazar Beach, Bangladesh" {...register('location', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input type="datetime-local" className="input" {...register('date', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input type="datetime-local" className="input" {...register('endDate')} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ticket Types</h2>
            <button type="button" onClick={() => append({ type: '', price: '', quantity: '' })}
              className="flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700">
              <Plus size={16} /> Add Type
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <input className="input py-2 text-sm" placeholder="General, VIP..." {...register(`tickets.${index}.type`, { required: true })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Price (৳)</label>
                  <input type="number" className="input py-2 text-sm" placeholder="0" {...register(`tickets.${index}.price`, { required: true })} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                    <input type="number" className="input py-2 text-sm" {...register(`tickets.${index}.quantity`, { required: true })} />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-2 hover:bg-red-50 rounded text-red-500 mb-0.5">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Submit for Approval'}
          </button>
          <button type="button" onClick={() => navigate('/manager/events')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── SCAN TICKET PAGE ─────────────────────────────────────────────────────────
export function ScanTicketPage() {
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanTicket = async () => {
    if (!qrInput.trim()) { toast.error('Enter QR data'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/bookings/scan', { qrData: qrInput.trim() });
      setResult({ success: true, booking: data.booking });
      toast.success('Entry verified!');
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Invalid ticket' });
      toast.error(err.response?.data?.message || 'Invalid ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan QR Tickets</h1>
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-lg">
          <ScanLine className="text-primary-600" size={24} />
          <p className="text-sm text-primary-700">Paste or type the QR code data to verify entry</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Data</label>
            <textarea rows={4} className="input font-mono text-sm" placeholder='{"ref":"SFB-...","event":"...","user":"..."}'
              value={qrInput} onChange={e => setQrInput(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={scanTicket} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
            <button onClick={() => { setQrInput(''); setResult(null); }} className="btn-secondary">Clear</button>
          </div>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.success ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-500" size={24} />}
              <p className={`font-bold text-lg ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Entry Verified ✓' : 'Invalid Ticket ✗'}
              </p>
            </div>
            {result.success && result.booking && (
              <div className="text-sm space-y-1 text-gray-700">
                <p><strong>Event:</strong> {result.booking.event?.title}</p>
                <p><strong>Guest:</strong> {result.booking.user?.name}</p>
                <p><strong>Ref:</strong> {result.booking.bookingRef}</p>
              </div>
            )}
            {!result.success && <p className="text-sm text-red-600">{result.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TICKET SALES PAGE ────────────────────────────────────────────────────────
export function TicketSalesPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.get('/events/my').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const totalSold = events.reduce((s, e) => s + (e.tickets?.reduce((ts, t) => ts + (t.sold || 0), 0) || 0), 0);
  const totalCapacity = events.reduce((s, e) => s + (e.totalCapacity || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + (e.tickets?.reduce((ts, t) => ts + ((t.sold || 0) * Number(t.price)), 0) || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ticket Sales</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Tickets Sold', value: totalSold.toLocaleString(), icon: Ticket, color: 'bg-blue-500' },
          { label: 'Overall Fill Rate', value: `${totalCapacity ? Math.round((totalSold / totalCapacity) * 100) : 0}%`, icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-cyan-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Ticket size={40} className="mx-auto mb-3 opacity-30" />
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const sold = ev.tickets?.reduce((s, t) => s + (t.sold || 0), 0) || 0;
            const capacity = ev.totalCapacity || 0;
            const revenue = ev.tickets?.reduce((s, t) => s + ((t.sold || 0) * Number(t.price)), 0) || 0;
            const fill = capacity ? Math.round((sold / capacity) * 100) : 0;
            const isOpen = expanded[ev.id];

            return (
              <div key={ev.id} className="card overflow-hidden">
                <button onClick={() => toggle(ev.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 shrink-0">
                    {ev.coverImage ? <img src={ev.coverImage} alt="" className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center h-full"><Ticket size={20} className="text-white opacity-60" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${fill >= 80 ? 'bg-red-500' : fill >= 50 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${fill}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{fill}% full</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <p className="font-bold text-gray-900">{sold} <span className="text-xs font-normal text-gray-400">/ {capacity}</span></p>
                    <p className="text-xs text-green-600 font-semibold">৳{revenue.toLocaleString()}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </button>

                {isOpen && ev.tickets?.length > 0 && (
                  <div className="border-t bg-gray-50 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ticket Type Breakdown</p>
                    <div className="space-y-2">
                      {ev.tickets.map(t => {
                        const tSold = t.sold || 0;
                        const tFill = t.quantity ? Math.round((tSold / t.quantity) * 100) : 0;
                        return (
                          <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{t.type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${tFill}%` }} />
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{tFill}%</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 text-sm">
                              <p className="font-semibold text-gray-900">{tSold} <span className="text-xs text-gray-400 font-normal">/ {t.quantity}</span></p>
                              <p className="text-xs text-gray-500">৳{Number(t.price).toLocaleString()} each</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-green-600">৳{(tSold * Number(t.price)).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SOLD TICKETS PAGE ────────────────────────────────────────────────────────
export function SoldTicketsPage() {
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

  useEffect(() => { api.get('/events/my').then(({ data }) => setEvents(data.events)); }, []);
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

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email or booking ref..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
        </div>
        <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="attended">Attended</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-3">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found</p>

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
                <div className="shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash size={13} className="text-gray-400" />
                    <span className="font-mono text-xs text-gray-600 font-semibold">{b.bookingRef}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-500'}`}>
                    {b.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-semibold text-gray-900 truncate">{b.event?.title}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(b.event?.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{b.event?.location}</span>
                    <span className="flex items-center gap-1"><Ticket size={12} />{b.ticket?.type} × {b.quantity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                    <User size={13} className="text-gray-400" />
                    <span className="font-medium">{b.user?.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{b.user?.email}</p>
                  <p className="text-base font-bold text-blue-600">৳{Number(b.totalAmount).toLocaleString()}</p>
                  {b.payment?.method && <p className="text-xs text-gray-400 capitalize">{b.payment.method}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
