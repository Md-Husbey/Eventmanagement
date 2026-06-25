import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Waves, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { useAuth } from '../../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => { setEvent(data.event); if (data.event.tickets?.length) setSelectedTicket(data.event.tickets[0].id); })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTicket) { toast.error('Select a ticket type'); return; }
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', { eventId: id, ticketId: selectedTicket, quantity });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/bookings/${data.booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl mb-6" />
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );

  if (!event) return null;

  const avgRating = event.reviews?.length
    ? (event.reviews.reduce((s, r) => s + r.rating, 0) / event.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Cover */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary-400 to-ocean-500">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-white"><Waves size={64} className="opacity-40" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <span className="badge bg-white/20 text-white border border-white/30 mb-2">
            {event.category?.replace(/_/g, ' ').toUpperCase()}
          </span>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-lg mb-4">Event Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="text-primary-500" size={18} />
                <span>{new Date(event.date).toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="text-primary-500" size={18} />
                <span>{new Date(event.date).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="text-primary-500" size={18} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="text-primary-500" size={18} />
                <span>{event.availableSeats} seats available</span>
              </div>
            </div>
            {event.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
              <span>Organized by</span>
              <span className="font-medium text-gray-800">{event.organizer?.name}</span>
            </div>
          </div>

          {/* Reviews */}
          {event.reviews?.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-lg">Reviews</h2>
                {avgRating && (
                  <div className="flex items-center gap-1 text-sand-400">
                    <Star size={16} fill="currentColor" />
                    <span className="font-medium text-gray-700">{avgRating}</span>
                    <span className="text-gray-400 text-sm">({event.reviews.length})</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {event.reviews.slice(0, 5).map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{review.user?.name}</span>
                      <div className="flex text-sand-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Card */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Book Tickets</h2>

          {event.tickets?.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets available</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {event.tickets?.map(ticket => (
                  <label key={ticket.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedTicket === ticket.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="ticket" value={ticket.id}
                        checked={selectedTicket === ticket.id}
                        onChange={() => setSelectedTicket(ticket.id)}
                        className="text-primary-600" />
                      <div>
                        <p className="font-medium text-sm">{ticket.type}</p>
                        <p className="text-xs text-gray-500">{ticket.quantity - ticket.sold} left</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary-600">৳{ticket.price}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input py-2">
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {selectedTicket && (
                <div className="flex justify-between text-sm font-medium mb-4 p-3 bg-gray-50 rounded-lg">
                  <span>Total</span>
                  <span className="text-primary-600 text-base font-bold">
                    ৳{(event.tickets?.find(t => t.id === selectedTicket)?.price || 0) * quantity}
                  </span>
                </div>
              )}

              <button onClick={handleBook} disabled={booking || !selectedTicket}
                className="btn-primary w-full disabled:opacity-50">
                {booking ? 'Processing...' : 'Book Now'}
              </button>
              {!user && <p className="text-xs text-gray-500 text-center mt-2">Login required to book</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
