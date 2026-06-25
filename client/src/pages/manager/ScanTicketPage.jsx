import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { ScanLine, CheckCircle, XCircle } from 'lucide-react';

export default function ScanTicketPage() {
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanTicket = async () => {
    if (!qrInput.trim()) { toast.error('Enter QR data'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/bookings/scan', { qrData: qrInput.trim() });
      setResult({ success: true, booking: data.booking });
      toast.success('Entry verified!');
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Invalid ticket' });
      toast.error(err.response?.data?.message || 'Invalid ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Scan QR Tickets</h1>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-lg">
          <ScanLine className="text-primary-600" size={24} />
          <p className="text-sm text-primary-700">Paste or type the QR code data to verify entry</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Data</label>
            <textarea rows={4} className="input font-mono text-sm" placeholder='{"ref":"SFB-...","event":"...","user":"..."}'
              value={qrInput} onChange={e => setQrInput(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={scanTicket} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Verifying...' : 'Verify Ticket'}
            </button>
            <button onClick={() => { setQrInput(''); setResult(null); }} className="btn-secondary">Clear</button>
          </div>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-xl border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.success ? <CheckCircle className="text-green-600" size={24} /> : <XCircle className="text-red-500" size={24} />}
              <p className={`font-bold text-lg ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Entry Verified ✓' : 'Invalid Ticket ✗'}
              </p>
            </div>
            {result.success && result.booking && (
              <div className="text-sm space-y-1 text-gray-700">
                <p><strong>Event:</strong> {result.booking.event?.title}</p>
                <p><strong>Guest:</strong> {result.booking.user?.name}</p>
                <p><strong>Ref:</strong> {result.booking.bookingRef}</p>
              </div>
            )}
            {!result.success && <p className="text-sm text-red-600">{result.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
