import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Download, X, Ticket, User, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../features/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  refunded:  'bg-gray-100 text-gray-600 border-gray-200',
  attended:  'bg-blue-100 text-blue-700 border-blue-200',
};

const PAYMENT_METHODS = ['stripe', 'sslcommerz', 'bkash', 'nagad', 'cash'];

function TicketCard({ booking }) {
  const event = booking.event;
  const qrValue = booking.qrCodeData || booking.bookingRef;
  const eventDate = new Date(event?.date);

  return (
    <div
      id="ticket-card"
      className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white font-sans"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold">SeaFest BD</p>
            <h2 className="text-xl font-bold mt-1 leading-tight">{event?.title}</h2>
          </div>
          <div className="text-right">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {booking.ticket?.type}
            </span>
          </div>
        </div>
      </div>

      {/* Tear line */}
      <div className="relative flex items-center">
        <div className="absolute -left-3 w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
        <div className="w-full border-t-2 border-dashed border-gray-200 mx-3" />
        <div className="absolute -right-3 w-6 h-6 rounded-full bg-gray-100 border border-gray-200" />
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex gap-6">
        {/* Details */}
        <div className="flex-1 space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Calendar size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-400 text-xs">Date & Time</p>
              <p className="font-semibold text-gray-800">
                {eventDate.toLocaleDateString('en-BD', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs">
                {eventDate.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
              </p>
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

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-2">
            <QRCodeSVG value={qrValue} size={100} level="H" />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Scan at entrance</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-dashed border-gray-200 px-6 py-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">Total Paid</p>
          <p className="font-bold text-blue-700 text-lg">৳{Number(booking.totalAmount).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Payment</p>
          <p className="text-sm font-semibold text-gray-700 capitalize">{booking.payment?.method || 'Confirmed'}</p>
        </div>
        <div className="text-right">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
            {booking.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
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
      await api.post('/payments/confirm', {
        bookingId: id, method: payMethod, transactionId: `TXN-${Date.now()}`,
      });
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

      {/* Standard Ticket */}
      {isConfirmed && <TicketCard booking={booking} />}

      {/* Download Button */}
      {isConfirmed && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          <Download size={18} />
          {downloading ? 'Preparing PDF...' : 'Download Ticket (PDF)'}
        </button>
      )}

      {/* Booking Info Card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-ocean-500 p-6 text-white">
          <h1 className="text-xl font-bold">{booking.event?.title}</h1>
          <p className="text-primary-200 text-sm mt-1">Booking Ref: {booking.bookingRef}</p>
          <span className={`badge mt-2 border ${STATUS_COLORS[booking.status]}`}>{booking.status.toUpperCase()}</span>
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

          {/* Payment */}
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

          {/* Cancel */}
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
