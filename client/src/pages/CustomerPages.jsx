import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Calendar, MapPin, Ticket, User, Hash, Download, X, ArrowRight, FileCheck, Clock } from 'lucide-react';
import api, { useAuth } from '../App';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
  attended: 'bg-blue-100 text-blue-700',
};

const STATUS_BORDER = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  attended: 'bg-blue-100 text-blue-700 border-blue-200',
};

const PAYMENT_METHODS = ['stripe', 'sslcommerz', 'bkash', 'nagad', 'cash'];

// ─── MY BOOKINGS PAGE ─────────────────────────────────────────────────────────
export function MyBookingsPage() {
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

// ─── TICKET CARD ──────────────────────────────────────────────────────────────
function TicketCard({ booking }) {
  const event = booking.event;
  const qrValue = booking.qrCodeData || booking.bookingRef;
  const eventDate = new Date(event?.date);
  return (
    <div id="ticket-card" className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white font-sans">
      <div className="bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold">SeaFest BD</p>
            <h2 className="text-xl font-bold mt-1 leading-tight">{event?.title}</h2>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{booking.ticket?.type}</span>
        </div>
      </div>
      <div className="relative flex items-center">
        <div className="absolute -left-3 w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
        <div className="w-full border-t-2 border-dashed border-gray-200 mx-3" />
        <div className="absolute -right-3 w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
      </div>
      <div className="px-6 py-5 flex gap-6">
        <div className="flex-1 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Calendar size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Date & Time</p>
              <p className="font-semibold text-gray-800">{eventDate.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-gray-500 text-xs">{eventDate.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Venue</p>
              <p className="font-semibold text-gray-800">{event?.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Ticket size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Ticket Type & Qty</p>
              <p className="font-semibold text-gray-800">{booking.ticket?.type} × {booking.quantity}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Hash size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Booking Ref</p>
              <p className="font-semibold text-gray-800 text-xs tracking-wider">{booking.bookingRef}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-2">
            <QRCodeSVG value={qrValue} size={100} level="H" />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Scan at entrance</p>
        </div>
      </div>
      <div className="bg-gray-50 border-t border-dashed border-gray-200 px-6 py-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">Total Paid</p>
          <p className="font-bold text-blue-700 text-lg">৳{Number(booking.totalAmount).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Payment</p>
          <p className="text-sm font-semibold text-gray-700 capitalize">{booking.payment?.method || 'Confirmed'}</p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{booking.status}</span>
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL PAGE ──────────────────────────────────────────────────────
export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState('bkash');
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/bookings/${id}`).then(({ data }) => setBooking(data.booking)).finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      await api.post('/payments/confirm', { bookingId: id, method: payMethod, transactionId: `TXN-${Date.now()}` });
      toast.success('Payment confirmed! Your ticket is ready.');
      api.get(`/bookings/${id}`).then(({ data }) => setBooking(data.booking));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const el = document.getElementById('ticket-card');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfW, pdfH);
      pdf.save(`SeaFest-Ticket-${booking.bookingRef}.pdf`);
      toast.success('Ticket downloaded!');
    } catch {
      toast.error('Download failed, try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><p>Loading...</p></div>;
  if (!booking) return null;
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'attended';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {isConfirmed && <TicketCard booking={booking} />}
      {isConfirmed && (
        <button onClick={handleDownload} disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
          <Download size={18} />
          {downloading ? 'Preparing PDF...' : 'Download Ticket (PDF)'}
        </button>
      )}

      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-ocean-500 p-6 text-white">
          <h1 className="text-xl font-bold">{booking.event?.title}</h1>
          <p className="text-primary-200 text-sm mt-1">Booking Ref: {booking.bookingRef}</p>
          <span className={`badge mt-2 border ${STATUS_BORDER[booking.status]}`}>{booking.status.toUpperCase()}</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium flex items-center gap-1 mt-0.5">
                <Calendar size={14} />
                {new Date(booking.event?.date).toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium flex items-center gap-1 mt-0.5"><MapPin size={14} />{booking.event?.location}</p>
            </div>
            <div>
              <p className="text-gray-500">Ticket Type</p>
              <p className="font-medium mt-0.5">{booking.ticket?.type}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium mt-0.5">{booking.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-bold text-primary-600 text-lg mt-0.5">৳{Number(booking.totalAmount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="font-medium mt-0.5 capitalize">{booking.payment?.method || 'Pending'}</p>
            </div>
          </div>

          {booking.status === 'pending' && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Complete Payment</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`py-2 rounded-lg border text-sm font-medium capitalize transition-colors
                      ${payMethod === m ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={handlePay} disabled={paying} className="btn-primary w-full">
                {paying ? 'Processing...' : `Pay ৳${booking.totalAmount} via ${payMethod}`}
              </button>
            </div>
          )}

          {['pending', 'confirmed'].includes(booking.status) && (
            <div className="border-t pt-4">
              <button onClick={handleCancel} disabled={cancelling}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium">
                <X size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function ProfilePage() {
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
                <input className="input bg-gray-50 text-gray-500" value={user?.email} disabled />
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

// ─── ORGANIZER APPLY PAGE ─────────────────────────────────────────────────────
const STATUS_INFO = {
  pending: { color: 'text-yellow-600 bg-yellow-50', label: 'Pending Review', icon: Clock },
  under_review: { color: 'text-blue-600 bg-blue-50', label: 'Under Review', icon: Clock },
  approved: { color: 'text-green-600 bg-green-50', label: 'Approved — You are now an Organizer!', icon: FileCheck },
  rejected: { color: 'text-red-600 bg-red-50', label: 'Rejected', icon: null },
};

export function OrganizerApplyPage() {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/organizer/my-application').then(({ data }) => setExisting(data.application)).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/organizer/apply', {
        organizationName: data.organizationName,
        organizationInfo: data.organizationInfo,
        nationalId: data.nationalId,
        bankDetails: { bankName: data.bankName, accountNumber: data.accountNumber },
      });
      toast.success('Application submitted successfully!');
      api.get('/organizer/my-application').then(({ data }) => setExisting(data.application));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10"><p>Loading...</p></div>;

  if (existing) {
    const info = STATUS_INFO[existing.status];
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 text-center">
          <FileCheck size={48} className="text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Application Status</h1>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${info.color}`}>{info.label}</div>
          <p className="text-gray-500 text-sm mt-4">Organization: <strong>{existing.organizationName}</strong></p>
          {existing.adminNote && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-left">
              <strong>Admin Note:</strong> {existing.adminNote}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Become an Event Organizer</h1>
          <p className="text-gray-500 text-sm mt-1">Submit your application to create and manage events on SeaFest BD</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input className="input" {...register('organizationName', { required: 'Required' })} />
            {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Description</label>
            <textarea rows={3} className="input" {...register('organizationInfo')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">National ID Number *</label>
            <input className="input" {...register('nationalId', { required: 'Required' })} />
            {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input className="input" {...register('bankName')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input className="input" {...register('accountNumber')} />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
            After submission, admin will review your application within 2-3 business days.
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
