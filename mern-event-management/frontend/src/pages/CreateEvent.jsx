import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import EventForm from '../components/events/EventForm.jsx';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event published');
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Create a new event</h1>
      <p className="mt-1 text-sm text-ink/60">Fill in the details below to publish a listing.</p>
      <div className="card mt-6 p-6">
        <EventForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish event" />
      </div>
    </div>
  );
}
