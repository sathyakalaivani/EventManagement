import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Users as UsersIcon, CalendarRange, ShieldCheck, ShieldOff } from 'lucide-react';
import api from '../api/axios.js';
import Spinner from '../components/common/Spinner.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';

export default function Dashboard() {
  const [tab, setTab] = useState('events');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Admin dashboard</h1>
        {tab === 'events' && (
          <Link to="/admin/events/new" className="btn-accent">
            <Plus className="h-4 w-4" /> New event
          </Link>
        )}
      </div>

      <div className="mt-6 flex gap-2 border-b border-plum-100">
        <button
          onClick={() => setTab('events')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${
            tab === 'events' ? 'border-plum-700 text-plum-700' : 'border-transparent text-ink/50'
          }`}
        >
          <CalendarRange className="h-4 w-4" /> Events
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${
            tab === 'users' ? 'border-plum-700 text-plum-700' : 'border-transparent text-ink/50'
          }`}
        >
          <UsersIcon className="h-4 w-4" /> Users
        </button>
      </div>

      <div className="mt-6">
        {tab === 'events' ? <EventsTab /> : <UsersTab />}
      </div>
    </div>
  );
}

function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events/mine');
      setEvents(data.events);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${deleteId}`);
      toast.success('Event deleted');
      setEvents((prev) => prev.filter((e) => e._id !== deleteId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  if (events.length === 0) {
    return (
      <div className="py-16 text-center text-ink/60">
        <p className="font-display text-xl">You haven't created any events yet.</p>
        <Link to="/admin/events/new" className="btn-primary mt-4 inline-flex">
          <Plus className="h-4 w-4" /> Create your first event
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-plum-100 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-plum-100 bg-plum-50 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Attendees</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-plum-50">
            {events.map((event) => (
              <tr key={event._id}>
                <td className="px-4 py-3 font-medium text-ink">
                  <Link to={`/events/${event._id}`} className="hover:text-plum-700">{event.title}</Link>
                </td>
                <td className="px-4 py-3 text-ink/70">{format(new Date(event.date), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3 text-ink/70">{event.attendees.length} / {event.capacity}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-sage">
                    {event.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/events/${event._id}/edit`} className="rounded-lg p-2 text-plum-600 hover:bg-plum-50">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setDeleteId(event._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete this event?"
        message="This action cannot be undone. All registrations will be removed."
        confirmLabel="Delete event"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (u) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/users/${u.id}`, { role: nextRole });
      toast.success(`${u.name} is now ${nextRole}`);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-plum-100 bg-white">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-plum-100 bg-plum-50 text-xs uppercase tracking-wide text-ink/50">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-plum-50">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
              <td className="px-4 py-3 text-ink/70">{u.email}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-plum-50 px-2.5 py-1 text-xs font-medium text-plum-700">
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => toggleRole(u)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-plum-600 hover:bg-plum-50"
                >
                  {u.role === 'admin'
                    ? <><ShieldOff className="h-3.5 w-3.5" /> Revoke admin</>
                    : <><ShieldCheck className="h-3.5 w-3.5" /> Make admin</>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
