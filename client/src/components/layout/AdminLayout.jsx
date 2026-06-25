import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calendar, FileCheck, BarChart3, LogOut, Waves } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/applications', label: 'Applications', icon: FileCheck },
  { to: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-5 border-b border-primary-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Waves size={22} className="text-sand-300" />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </div>
          <p className="text-primary-400 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-primary-700 text-white' : 'text-primary-300 hover:bg-primary-800 hover:text-white'}`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-800">
          <p className="text-sm text-primary-300 mb-3">{user?.name}</p>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-primary-400 hover:text-white text-sm transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
