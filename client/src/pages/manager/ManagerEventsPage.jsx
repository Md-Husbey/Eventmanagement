import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { Plus, Edit2, Trash2, Waves } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  suspended: 'bg-orange-100 text-orange-700',
};

export default function ManagerEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/events/my').then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Link to="/manager/events/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Event
        </Link>
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
