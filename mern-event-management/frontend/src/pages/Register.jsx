import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Welcome to Venue, ${user.name.split(' ')[0]}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Ticket className="h-8 w-8 rotate-[-15deg] text-plum-700" />
        <h1 className="mt-3 font-display text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Join Venue to book and manage events.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name" required className="input"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jordan Lee"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email" type="email" required className="input"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password" type="password" required minLength={8} className="input"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-plum-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
