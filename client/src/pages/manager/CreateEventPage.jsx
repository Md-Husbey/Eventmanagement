import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../features/api';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'dj_party', label: 'DJ Party' },
  { value: 'beach_party', label: 'Beach Party' },
  { value: 'food_festival', label: 'Food Festival' },
  { value: 'music_concert', label: 'Music Concert' },
  { value: 'wedding_event', label: 'Wedding Event' },
  { value: 'cultural_program', label: 'Cultural Program' },
  { value: 'tourism_festival', label: 'Tourism Festival' },
  { value: 'new_year', label: 'New Year Celebration' },
  { value: 'corporate_event', label: 'Corporate Event' },
  { value: 'hotel_event', label: 'Hotel Event' },
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { tickets: [{ type: 'General', price: '', quantity: '' }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'tickets' });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await api.post('/events', {
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        endDate: data.endDate,
        location: data.location,
        totalCapacity: data.totalCapacity,
        availableSeats: data.totalCapacity,
        basePrice: data.tickets[0]?.price || 0,
      });

      // Create tickets
      await Promise.all(data.tickets.map(t =>
        api.post('/events/tickets', { ...t, eventId: res.event.id }).catch(() => {})
      ));

      toast.success('Event created! Awaiting admin approval.');
      navigate('/manager/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input className="input" {...register('title', { required: 'Title required' })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="input" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select className="input" {...register('category', { required: true })}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" className="input" {...register('totalCapacity')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input className="input" placeholder="Cox's Bazar Beach, Bangladesh" {...register('location', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input type="datetime-local" className="input" {...register('date', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input type="datetime-local" className="input" {...register('endDate')} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ticket Types</h2>
            <button type="button" onClick={() => append({ type: '', price: '', quantity: '' })}
              className="flex items-center gap-1 text-primary-600 text-sm hover:text-primary-700">
              <Plus size={16} /> Add Type
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <input className="input py-2 text-sm" placeholder="General, VIP..." {...register(`tickets.${index}.type`, { required: true })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Price (৳)</label>
                  <input type="number" className="input py-2 text-sm" placeholder="0" {...register(`tickets.${index}.price`, { required: true })} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                    <input type="number" className="input py-2 text-sm" {...register(`tickets.${index}.quantity`, { required: true })} />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-2 hover:bg-red-50 rounded text-red-500 mb-0.5">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Submit for Approval'}
          </button>
          <button type="button" onClick={() => navigate('/manager/events')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
