import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, QrCode, Ticket } from 'lucide-react';
import api from '../../features/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
  attended: 'bg-blue-100 text-blue-700',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings').then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No bookings yet</p>
          <Link to="/events" className="btn-primary mt-4 inline-block">Browse Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <Link key={booking.id} to={`/bookings/${booking.id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ticket className="text-primary-600" size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{booking.event?.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <Calendar size={13} />
                  <span>{new Date(booking.event?.date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Ref: {booking.bookingRef}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-primary-600">৳{booking.totalAmount}</p>
                <span className={`badge mt-1 ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
