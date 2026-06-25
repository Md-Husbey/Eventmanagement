import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { CheckCircle, XCircle, PauseCircle, Calendar } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-700',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [note, setNote] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const fetchEvents = () => {
    setLoading(true);
    api.get('/admin/events', { params: { status } }).then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [status]);

  const approveEvent = async (id, newStatus) => {
    try {
      await api.put(`/admin/events/${id}/status`, { status: newStatus, note });
      toast.success(`Event ${newStatus}`);
      fetchEvents();
      setActionModal(null);
      setNote('');
    } catch { toast.error('Action failed'); }
  };

  const STATUSES = ['', 'pending', 'approved', 'rejected', 'suspended'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Event Management</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button key={s}
            onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize
              ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Event', 'Organizer', 'Date', 'Category', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <p className="line-clamp-1">{ev.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ev.organizer?.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(ev.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 capitalize">{ev.category?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[ev.status]}`}>{ev.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {ev.status !== 'approved' && (
                        <button onClick={() => setActionModal({ event: ev, action: 'approved' })}
                          className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Approve">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {ev.status !== 'rejected' && (
                        <button onClick={() => setActionModal({ event: ev, action: 'rejected' })}
                          className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Reject">
                          <XCircle size={16} />
                        </button>
                      )}
                      {ev.status === 'approved' && (
                        <button onClick={() => approveEvent(ev.id, 'suspended')}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Suspend">
                          <PauseCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && events.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={40} className="mx-auto mb-2" />
              <p>No events found</p>
            </div>
          )}
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-2 capitalize">{actionModal.action} Event</h2>
            <p className="text-gray-600 text-sm mb-4">"{actionModal.event.title}"</p>
            <textarea rows={3} className="input text-sm" placeholder="Admin note (optional)" value={note} onChange={e => setNote(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => approveEvent(actionModal.event.id, actionModal.action)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors
                  ${actionModal.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Confirm
              </button>
              <button onClick={() => { setActionModal(null); setNote(''); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
