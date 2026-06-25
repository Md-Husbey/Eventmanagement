import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const { register: reg1, handleSubmit: hs1 } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const { register: reg2, handleSubmit: hs2, watch, reset } = useForm();
  const [tab, setTab] = useState('profile');

  const updateProfile = async (data) => {
    try {
      await api.put('/auth/profile', data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const changePassword = async (data) => {
    try {
      await api.put('/auth/change-password', { currentPassword: data.current, newPassword: data.newPass });
      toast.success('Password changed');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                : <User className="text-primary-600" size={32} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="badge bg-primary-100 text-primary-700 mt-1 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b">
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors
                ${tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'profile' ? 'Edit Profile' : 'Change Password'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'profile' ? (
            <form onSubmit={hs1(updateProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input className="input" {...reg1('name', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input" {...reg1('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input" value={user?.email} disabled className="input bg-gray-50 text-gray-500" />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          ) : (
            <form onSubmit={hs2(changePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" className="input" {...reg2('current', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" className="input" {...reg2('newPass', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" className="input"
                  {...reg2('confirm', { validate: v => v === watch('newPass') || 'Passwords do not match' })} />
              </div>
              <button type="submit" className="btn-primary">Change Password</button>
            </form>
          )}
        </div>

        {user?.role === 'customer' && (
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <Link to="/become-organizer" className="flex items-center justify-between p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div>
                  <p className="font-medium text-primary-800">Become an Event Organizer</p>
                  <p className="text-sm text-primary-600">Apply to create and manage events</p>
                </div>
                <ArrowRight className="text-primary-600" size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
