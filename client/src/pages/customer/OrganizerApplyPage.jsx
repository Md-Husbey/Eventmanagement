import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { FileCheck, Clock } from 'lucide-react';

const STATUS_INFO = {
  pending: { color: 'text-yellow-600 bg-yellow-50', label: 'Pending Review', icon: Clock },
  under_review: { color: 'text-blue-600 bg-blue-50', label: 'Under Review', icon: Clock },
  approved: { color: 'text-green-600 bg-green-50', label: 'Approved — You are now an Organizer!', icon: FileCheck },
  rejected: { color: 'text-red-600 bg-red-50', label: 'Rejected', icon: null },
};

export default function OrganizerApplyPage() {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/organizer/my-application')
      .then(({ data }) => setExisting(data.application))
      .finally(() => setLoading(false));
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
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${info.color}`}>
            {info.label}
          </div>
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
