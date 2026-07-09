import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-marigold-600' : 'text-ink/70 hover:text-plum-700'
  }`;

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    setOpen(false);
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Browse events' },
    ...(isAuthenticated ? [{ to: '/my-events', label: isAdmin ? 'My listings' : 'My tickets' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-plum-100 bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-plum-700">
          <Ticket className="h-6 w-6 rotate-[-15deg]" strokeWidth={2.2} />
          <span className="font-display text-xl font-semibold">Venue</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-ink/70">
                <User className="h-4 w-4" /> {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-ghost">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-accent">Get started</Link>
            </>
          )}
        </div>

        <button
          className="p-2 text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-plum-100 bg-cream px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-outline w-full justify-center">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn-outline flex-1 justify-center" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-accent flex-1 justify-center" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </div>
            )}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-sm text-plum-700" onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Admin dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
