import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Ticket className="h-10 w-10 rotate-[-15deg] text-plum-300" />
      <h1 className="mt-4 font-display text-4xl font-semibold text-ink">404</h1>
      <p className="mt-2 text-ink/60">This page took a wrong turn on the way to the venue.</p>
      <Link to="/" className="btn-primary mt-6">Back to events</Link>
    </div>
  );
}
