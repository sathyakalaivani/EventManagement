import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Users } from 'lucide-react';

export default function EventCard({ event }) {
  const dateLabel = format(new Date(event.date), 'MMM d, yyyy');
  const timeLabel = format(new Date(event.date), 'h:mm a');
  const isFull = event.spotsRemaining === 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-plum-100">
        {event.image?.url ? (
          <img
            src={event.image.url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-plum-300">
            {event.title.charAt(0)}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-marigold-500 px-3 py-1 text-xs font-semibold text-ink">
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-plum-500">
            {dateLabel} · {timeLabel}
          </p>
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink line-clamp-2">
          {event.title}
        </h3>

        <div className="ticket-divider my-4" />

        <div className="mt-auto flex items-center justify-between text-sm text-ink/60">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location?.isOnline ? 'Online' : event.location?.city}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {isFull ? 'Sold out' : `${event.spotsRemaining} left`}
          </span>
        </div>

        <div className="mt-3 font-display text-base font-semibold text-plum-700">
          {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
        </div>
      </div>
    </Link>
  );
}
