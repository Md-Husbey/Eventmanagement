import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { Waves } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-100 p-3 rounded-full">
            <Waves className="text-primary-600" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        {sent ? (
          <p className="text-green-600">Check your email for the password reset link.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" {...register('email', { required: true })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <Link to="/login" className="text-primary-600 text-sm mt-4 inline-block hover:underline">← Back to Login</Link>
      </div>
    </div>
  );
}
