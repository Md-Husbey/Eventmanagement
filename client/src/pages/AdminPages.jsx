import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar, Ticket, TrendingUp, AlertCircle, DollarSign, Search, Edit2, Trash2, UserX, UserCheck, CheckCircle, XCircle, PauseCircle, Eye } from 'lucide-react';
import api from '../App';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-700',
  under_review: 'bg-blue-100 text-blue-700',
};

const ROLES = ['customer', 'manager', 'hotel_manager', 'support', 'finance', 'admin'];

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, link }) {
  const el = (
    <div className={`card p-5 flex items-center gap-4 ${link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
  return link ? <Link to={link}>{el}</Link> : el;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.stats));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={stats ? `৳${stats.totalRevenue.toLocaleString()}` : null} icon={DollarSign} color="bg-green-500" link="/admin/revenue" />
        <StatCard label="Today's Sales" value={stats ? `৳${stats.todaySales.toLocaleString()}` : null} icon={TrendingUp} color="bg-primary-500" />
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="bg-purple-500" link="/admin/users" />
        <StatCard label="Active Events" value={stats?.totalEvents} icon={Calendar} color="bg-ocean-500" link="/admin/events" />
        <StatCard label="Confirmed Bookings" value={stats?.totalBookings} icon={Ticket} color="bg-indigo-500" />
        <StatCard label="Pending Events" value={stats?.pendingEvents} icon={AlertCircle} color="bg-orange-500" link="/admin/events?status=pending" />
        <StatCard label="Pending Applications" value={stats?.pendingApplications} icon={AlertCircle} color="bg-red-500" link="/admin/applications" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/admin/events?status=pending" className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <span className="text-sm font-medium text-orange-700">Review Pending Events</span>
              <span className="badge bg-orange-100 text-orange-700">{stats?.pendingEvents || 0}</span>
            </Link>
            <Link to="/admin/applications?status=pending" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <span className="text-sm font-medium text-red-700">Review Applications</span>
              <span className="badge bg-red-100 text-red-700">{stats?.pendingApplications || 0}</span>
            </Link>
            <Link to="/admin/users" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <span className="text-sm font-medium text-purple-700">Manage Users</span>
              <span className="badge bg-purple-100 text-purple-700">{stats?.totalUsers || 0}</span>
            </Link>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">System Info</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between"><span>Platform</span><span className="font-medium">SeaFest BD v1.0</span></div>
            <div className="flex justify-between"><span>Location</span><span className="font-medium">Cox's Bazar, BD</span></div>
            <div className="flex justify-between"><span>Year</span><span className="font-medium">2026</span></div>
            <div className="flex justify-between"><span>Developer</span><span className="font-medium">Husbey Hawlader</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN USERS PAGE ─────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users', { params: { search } }).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
      setEditUser(null);
    } catch { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <div className="card overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)} className="input pl-9 py-2" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-100 text-primary-700 capitalize">{u.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditUser(u)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit2 size={14} /></button>
                      <button onClick={() => updateUser(u.id, { isSuspended: !u.isSuspended })}
                        className={`p-1.5 rounded ${u.isSuspended ? 'hover:bg-green-50 text-green-600' : 'hover:bg-orange-50 text-orange-500'}`}>
                        {u.isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">Edit User: {editUser.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="input" defaultValue={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => updateUser(editUser.id, { role: editUser.role })} className="btn-primary flex-1">Save</button>
              <button onClick={() => setEditUser(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN EVENTS PAGE ────────────────────────────────────────────────────────
export function AdminEventsPage() {
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
          <button key={s} onClick={() => setSearchParams(s ? { status: s } : {})}
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
                  <td className="px-4 py-3 font-medium max-w-xs"><p className="line-clamp-1">{ev.title}</p></td>
                  <td className="px-4 py-3 text-gray-500">{ev.organizer?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(ev.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500 capitalize">{ev.category?.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[ev.status]}`}>{ev.status}</span></td>
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

// ─── ADMIN APPLICATIONS PAGE ──────────────────────────────────────────────────
export function AdminApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const fetchApps = () => {
    setLoading(true);
    api.get('/admin/applications').then(({ data }) => setApps(data.applications)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}`, { status, note });
      toast.success(`Application ${status}`);
      fetchApps();
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
                      <button onClick={() => setSelected(app)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye size={16} /></button>
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => review(app.id, 'approved')} className="p-1.5 hover:bg-green-50 rounded text-green-600"><CheckCircle size={16} /></button>
                          <button onClick={() => setSelected({ ...app, _action: 'reject' })} className="p-1.5 hover:bg-red-50 rounded text-red-500"><XCircle size={16} /></button>
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
              {selected.bankDetails && <p><strong>Bank:</strong> {selected.bankDetails.bankName} - {selected.bankDetails.accountNumber}</p>}
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

// ─── ADMIN REVENUE PAGE ───────────────────────────────────────────────────────
export function AdminRevenuePage() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/revenue', { params: { period } }).then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, [period]);

  const total = data.reduce((s, d) => s + parseFloat(d.revenue || 0), 0);
  const totalTx = data.reduce((s, d) => s + parseInt(d.transactions || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Report</h1>
        <div className="flex gap-2">
          {['monthly', 'daily'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                ${period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-1">৳{total.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Transactions</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{totalTx}</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-sm">Avg per Transaction</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">৳{totalTx ? Math.round(total / totalTx).toLocaleString() : 0}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 capitalize">{period} Revenue</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center"><p className="text-gray-400">Loading chart...</p></div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center"><p className="text-gray-400">No revenue data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip formatter={(v) => [`৳${parseFloat(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
