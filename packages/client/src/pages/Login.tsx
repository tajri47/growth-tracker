import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? 'Login failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      navigate('/');
    } catch {
      setError('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = isSubmitting || !email.trim() || !password;

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-neutral-200 rounded-xl shadow-sm p-6 md:p-8">
      <h1 className="font-semibold text-2xl text-neutral-900">Welcome back</h1>
      <p className="text-sm text-neutral-600 mt-1">Login to continue your growth journey.</p>

      <form className="mt-6 space-y-4" onSubmit={submitLogin}>
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full rounded-md bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-neutral-600 mt-4">
        Do not have an account?{' '}
        <Link className="text-neutral-900 underline underline-offset-2" to="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
