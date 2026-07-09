import { useEffect, useState } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import api from '../api/axios.js';
import EventCard from '../components/events/EventCard.jsx';
import Spinner from '../components/common/Spinner.jsx';

const CATEGORIES = ['All', 'Conference', 'Workshop', 'Concert', 'Sports', 'Networking', 'Festival', 'Webinar', 'Other'];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events', {
          params: {
            search: search || undefined,
            category: category === 'All' ? undefined : category,
            upcoming: 'true',
            page,
            limit: 9,
          },
          signal: controller.signal,
        });
        setEvents(data.events);
        setPages(data.pages);
      } catch {
        // request cancelled or failed silently on this listing view
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchEvents, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [search, category, page]);

  return (
    <div>
      <section className="border-b border-plum-100 bg-plum-700 text-cream">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-marigold-300">
            <CalendarDays className="h-4 w-4" /> Now booking
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Find your next great night out — or host one yourself.
          </h1>
          <p className="mt-4 max-w-xl text-plum-100">
            Browse conferences, workshops, concerts and meetups, then claim your ticket in a couple of clicks.
          </p>

          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-cream p-1.5 pl-4 shadow-lg">
            <Search className="h-5 w-5 text-plum-400" />
            <input
              type="text"
              placeholder="Search events by name, tag, or topic..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-plum-700 bg-plum-700 text-cream'
                  : 'border-plum-200 text-ink/70 hover:border-plum-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center text-ink/60">
            <p className="font-display text-xl">No events match yet.</p>
            <p className="mt-1 text-sm">Try a different search term or category.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => <EventCard key={event._id} event={event} />)}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-full text-sm font-medium ${
                      p === page ? 'bg-plum-700 text-cream' : 'text-ink/60 hover:bg-plum-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
