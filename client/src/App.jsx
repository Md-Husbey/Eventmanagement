import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ManagerLayout from './components/layout/ManagerLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Customer Pages
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingDetailPage from './pages/customer/BookingDetailPage';
import ProfilePage from './pages/customer/ProfilePage';
import OrganizerApplyPage from './pages/customer/OrganizerApplyPage';

// Manager Pages
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage';
import ManagerEventsPage from './pages/manager/ManagerEventsPage';
import CreateEventPage from './pages/manager/CreateEventPage';
import ScanTicketPage from './pages/manager/ScanTicketPage';
import TicketSalesPage from './pages/manager/TicketSalesPage';
import SoldTicketsPage from './pages/manager/SoldTicketsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminRevenueePage from './pages/admin/AdminRevenuePage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Customer */}
          <Route element={<PublicLayout />}>
            <Route path="/bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/become-organizer" element={<ProtectedRoute><OrganizerApplyPage /></ProtectedRoute>} />
          </Route>

          {/* Manager */}
          <Route path="/manager" element={<ProtectedRoute roles={['manager', 'admin']}><ManagerLayout /></ProtectedRoute>}>
            <Route index element={<ManagerDashboardPage />} />
            <Route path="events" element={<ManagerEventsPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="ticket-sales" element={<TicketSalesPage />} />
            <Route path="sold-tickets" element={<SoldTicketsPage />} />
            <Route path="scan" element={<ScanTicketPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="revenue" element={<AdminRevenueePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
