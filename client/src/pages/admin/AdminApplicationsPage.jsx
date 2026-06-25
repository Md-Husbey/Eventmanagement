import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get('/admin/applications').then(({ data }) => setApps(data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}`, { status, note });
      toast.success(`Application ${status}`);
      fetch();
      setSelected(null);
      setNote('');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Organizer Applications</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Applicant', 'Organization', 'Submitted', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.user?.name}</p>
                    <p className="text-gray-400 text-xs">{app.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{app.organizationName}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[app.status]}`}>{app.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(app)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="View">
                        <Eye size={16} />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => review(app.id, 'approved')}
                            className="p-1.5 hover:bg-green-50 rounded text-green-600" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => setSelected({ ...app, _action: 'reject' })}
                            className="p-1.5 hover:bg-red-50 rounded text-red-500" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && apps.length === 0 && <p className="text-center py-12 text-gray-400">No applications found</p>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4">Application Details</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Name:</strong> {selected.user?.name}</p>
              <p><strong>Email:</strong> {selected.user?.email}</p>
              <p><strong>Organization:</strong> {selected.organizationName}</p>
              {selected.organizationInfo && <p><strong>Info:</strong> {selected.organizationInfo}</p>}
              <p><strong>National ID:</strong> {selected.nationalId}</p>
              {selected.bankDetails && (
                <p><strong>Bank:</strong> {selected.bankDetails.bankName} - {selected.bankDetails.accountNumber}</p>
              )}
            </div>
            {selected._action === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Note</label>
                <textarea rows={2} className="input text-sm" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            )}
            <div className="flex gap-3">
              {selected._action === 'reject' ? (
                <>
                  <button onClick={() => review(selected.id, 'rejected')} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm">Reject</button>
                  <button onClick={() => { setSelected(null); setNote(''); }} className="btn-secondary flex-1">Cancel</button>
                </>
              ) : (
                <button onClick={() => { setSelected(null); setNote(''); }} className="btn-secondary w-full">Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
