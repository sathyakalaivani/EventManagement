import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import EventCard from '../components/events/EventCard.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function MyEvents() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/events/mine');
        setEvents(data.events);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">
        {isAdmin ? 'My listings' : 'My tickets'}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        {isAdmin ? 'Events you have created and published.' : 'Events you have registered for.'}
      </p>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="py-24 text-center text-ink/60">
          <p className="font-display text-xl">Nothing here yet.</p>
          <p className="mt-1 text-sm">
            {isAdmin ? 'Create your first event to see it listed here.' : 'Reserve a spot at an event to see it here.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event._id} event={event} />)}
        </div>
      )}
    </div>
  );
}
