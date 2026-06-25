import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Ticket, TrendingUp } from 'lucide-react';
import api from '../../features/api';

export default function ManagerDashboardPage() {
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
        <Link to="/manager/events/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Event
        </Link>
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
                <span className={`badge ${ev.status === 'approved' ? 'bg-green-100 text-green-700' : ev.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ev.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
