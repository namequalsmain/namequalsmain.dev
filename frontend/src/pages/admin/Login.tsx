import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { setToken } from '@/lib/auth';

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { access_token } = await authApi.login({ username, password });
      setToken(access_token);
      navigate('/admin');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-8 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-2">
        Restricted
      </p>
      <h1 className="font-serif text-5xl tracking-tightest mb-8">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="font-mono text-xs text-accent border-l-2 border-accent pl-3">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary mt-4" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
