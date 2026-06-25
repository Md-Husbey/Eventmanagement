import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Waves, LogOut, Menu, X, User, LayoutDashboard, Users, Calendar, FileCheck, BarChart3, Plus, ScanLine, TicketCheck, ShoppingBag } from 'lucide-react';

// ─── API ──────────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: '/api' });
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default api;

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };
  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/bookings';

  return (
    <nav className="bg-gradient-to-r from-primary-900 via-primary-800 to-ocean-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Waves className="text-sand-300" size={28} />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="hover:text-sand-300 transition-colors text-sm font-medium">Events</Link>
            {user ? (
              <>
                <Link to={dashboardLink} className="hover:text-sand-300 transition-colors text-sm font-medium">Dashboard</Link>
                <Link to="/bookings" className="hover:text-sand-300 transition-colors text-sm font-medium">My Bookings</Link>
                <Link to="/profile" className="flex items-center gap-1.5 hover:text-sand-300 transition-colors text-sm font-medium">
                  <User size={16} />{user.name}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-sand-300 transition-colors text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-sand-400 hover:bg-sand-300 text-primary-900 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">Register</Link>
              </>
            )}
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-white/20 pt-4">
            <Link to="/events" onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">Events</Link>
            {user ? (
              <>
                <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">Dashboard</Link>
                <Link to="/bookings" onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">My Bookings</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">Profile</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left hover:text-sand-300 text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="hover:text-sand-300 text-sm">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <Waves className="text-sand-300" size={24} />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </div>
          <p className="text-primary-300 text-sm">Smart Tourism, Entertainment & Event Management Platform for Cox's Bazar.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-300">
            <li><Link to="/events" className="hover:text-white">All Events</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/become-organizer" className="hover:text-white">Become Organizer</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Event Types</h4>
          <ul className="space-y-2 text-sm text-primary-300">
            <li>DJ Party & Beach Party</li>
            <li>Food & Music Festivals</li>
            <li>Beach Weddings</li>
            <li>Cultural Programs</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sand-300">Contact</h4>
          <p className="text-sm text-primary-300">Cox's Bazar, Bangladesh</p>
          <p className="text-sm text-primary-300">info@seafestbd.com</p>
        </div>
      </div>
      <div className="border-t border-primary-800 py-4 text-center text-sm text-primary-400">
        © 2026 SeaFest BD. Developed by Husbey Hawlader.
      </div>
    </footer>
  );
}

// ─── LAYOUTS ──────────────────────────────────────────────────────────────────
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/applications', label: 'Applications', icon: FileCheck },
  { to: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
];

function AdminLayout() {
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
          {adminNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-primary-700 text-white' : 'text-primary-300 hover:bg-primary-800 hover:text-white'}`
              }>
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
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}

const managerNavItems = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/events', label: 'My Events', icon: Calendar },
  { to: '/manager/events/create', label: 'Create Event', icon: Plus },
  { to: '/manager/ticket-sales', label: 'Ticket Sales', icon: TicketCheck },
  { to: '/manager/sold-tickets', label: 'Sold Tickets', icon: ShoppingBag },
  { to: '/manager/scan', label: 'Scan Tickets', icon: ScanLine },
];

function ManagerLayout() {
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
          {managerNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-white/20 text-white' : 'text-cyan-100 hover:bg-white/10 hover:text-white'}`
              }>
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
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}

// ─── PROTECTED ROUTE ─────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ─── PAGE IMPORTS ────────────────────────────────────────────────────────────
import { HomePage, EventsPage, EventDetailPage } from './pages/PublicPages';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import { MyBookingsPage, BookingDetailPage, ProfilePage, OrganizerApplyPage } from './pages/CustomerPages';
import { ManagerDashboardPage, ManagerEventsPage, CreateEventPage, ScanTicketPage, TicketSalesPage, SoldTicketsPage } from './pages/ManagerPages';
import { AdminDashboardPage, AdminUsersPage, AdminEventsPage, AdminApplicationsPage, AdminRevenuePage } from './pages/AdminPages';

// ─── APP ──────────────────────────────────────────────────────────────────────
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<PublicLayout />}>
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/become-organizer" element={<ProtectedRoute><OrganizerApplyPage /></ProtectedRoute>} />
          </Route>

          <Route path="/manager" element={<ProtectedRoute roles={['manager', 'admin']}><ManagerLayout /></ProtectedRoute>}>
            <Route index element={<ManagerDashboardPage />} />
            <Route path="events" element={<ManagerEventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="ticket-sales" element={<TicketSalesPage />} />
            <Route path="sold-tickets" element={<SoldTicketsPage />} />
            <Route path="scan" element={<ScanTicketPage />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
