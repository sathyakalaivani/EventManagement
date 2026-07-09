import { Ticket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-plum-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink/60 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-plum-700">
          <Ticket className="h-4 w-4 rotate-[-15deg]" />
          <span className="font-display font-semibold">Venue</span>
        </div>
        <p>© {new Date().getFullYear()} Venue. Built for organizers and their communities.</p>
      </div>
    </footer>
  );
}
