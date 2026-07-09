import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch (err) {
      toast.error(err.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isRegistered = event?.attendees?.some((a) => a.user?._id === user?.id);
  const isFull = event && event.spotsRemaining === 0;

  const handleRegister = async () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
    setActionLoading(true);
    try {
      await api.post(`/events/${id}/register`);
      toast.success("You're in! See you there.");
      fetchEvent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/events/${id}/register`);
      toast.success('Registration cancelled');
      fetchEvent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!event) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-sm">
        <div className="h-64 w-full bg-plum-100 sm:h-80">
          {event.image?.url ? (
            <img src={event.image.url} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-5xl text-plum-300">
              {event.title.charAt(0)}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-marigold-100 px-3 py-1 text-xs font-semibold text-marigold-700">
                {event.category}
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                {event.title}
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                Hosted by {event.organizer?.name || 'Venue organizer'}
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Link to={`/admin/events/${event._id}/edit`} className="btn-outline">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
                <button onClick={() => setConfirmDelete(true)} className="btn bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="ticket-divider my-8" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 text-plum-500" />
              <div>
                <p className="text-sm font-semibold text-ink">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                <p className="text-sm text-ink/60">{format(new Date(event.date), 'h:mm a')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-plum-500" />
              <div>
                <p className="text-sm font-semibold text-ink">{event.location.venue}</p>
                <p className="text-sm text-ink/60">{event.location.isOnline ? 'Online event' : event.location.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-plum-500" />
              <div>
                <p className="text-sm font-semibold text-ink">{isFull ? 'Sold out' : `${event.spotsRemaining} spots left`}</p>
                <p className="text-sm text-ink/60">of {event.capacity} capacity</p>
              </div>
            </div>
          </div>

          <div className="ticket-divider my-8" />

          <h2 className="font-display text-lg font-semibold">About this event</h2>
          <p className="mt-2 whitespace-pre-line text-ink/70">{event.description}</p>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-plum-50 p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">Ticket price</p>
              <p className="font-display text-2xl font-semibold text-plum-700">
                {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
              </p>
            </div>

            {!isAdmin && (
              isRegistered ? (
                <button onClick={handleUnregister} disabled={actionLoading} className="btn-outline">
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cancel registration
                </button>
              ) : (
                <button onClick={handleRegister} disabled={actionLoading || isFull} className="btn-accent">
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isFull ? 'Sold out' : 'Reserve my spot'}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete this event?"
        message="This action cannot be undone. All registrations will be removed."
        confirmLabel="Delete event"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
