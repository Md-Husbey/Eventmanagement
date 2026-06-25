import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Waves, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager' : '/bookings';

  return (
    <nav className="bg-gradient-to-r from-primary-900 via-primary-800 to-ocean-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Waves className="text-sand-300" size={28} />
            <span>SeaFest <span className="text-sand-300">BD</span></span>
          </Link>

          {/* Desktop Nav */}
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
                <Link to="/register" className="bg-sand-400 hover:bg-sand-300 text-primary-900 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
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
