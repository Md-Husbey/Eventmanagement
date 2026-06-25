import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { Search, Edit2, Trash2, UserX, UserCheck } from 'lucide-react';

const ROLES = ['customer', 'manager', 'hotel_manager', 'support', 'finance', 'admin'];

export default function AdminUsersPage() {
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

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
                  <td className="px-4 py-3">
                    <span className="badge bg-primary-100 text-primary-700 capitalize">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditUser(u)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => updateUser(u.id, { isSuspended: !u.isSuspended })}
                        className={`p-1.5 rounded ${u.isSuspended ? 'hover:bg-green-50 text-green-600' : 'hover:bg-orange-50 text-orange-500'}`}>
                        {u.isSuspended ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
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
