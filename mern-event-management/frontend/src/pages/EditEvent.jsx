import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import EventForm from '../components/events/EventForm.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event);
      } catch (err) {
        toast.error(err.message);
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Event updated');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Edit event</h1>
      <p className="mt-1 text-sm text-ink/60">Update the details for “{event.title}”.</p>
      <div className="card mt-6 p-6">
        <EventForm
          initialValues={event}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
