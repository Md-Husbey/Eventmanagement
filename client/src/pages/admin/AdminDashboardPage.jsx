import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Ticket, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import api from '../../features/api';

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

export default function AdminDashboardPage() {
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
