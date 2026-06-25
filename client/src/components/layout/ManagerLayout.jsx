import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, Plus, ScanLine, LogOut, Waves, TicketCheck, ShoppingBag } from 'lucide-react';

const navItems = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/events', label: 'My Events', icon: Calendar },
  { to: '/manager/events/create', label: 'Create Event', icon: Plus },
  { to: '/manager/ticket-sales', label: 'Ticket Sales', icon: TicketCheck },
  { to: '/manager/sold-tickets', label: 'Sold Tickets', icon: ShoppingBag },
  { to: '/manager/scan', label: 'Scan Tickets', icon: ScanLine },
];

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-ocean-600 text-white flex flex-col">
        <div className="p-5 border-b border-ocean-500">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Waves size={22} className="text-sand-300" />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </div>
          <p className="text-cyan-200 text-xs mt-1">Manager Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-white/20 text-white' : 'text-cyan-100 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ocean-500">
          <p className="text-sm text-cyan-200 mb-3">{user?.name}</p>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 text-cyan-300 hover:text-white text-sm transition-colors">
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
