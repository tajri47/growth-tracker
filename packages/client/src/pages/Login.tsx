import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFooterLink, AuthShell } from '@/components/auth/AuthShell';
import { Field, fieldInputClassName } from '@/components/auth/Field';
import { Button } from '@/components/ui/button';
import { useDebouncedFieldValidation } from '@/hooks/useDebouncedFieldValidation';
import { validateEmail } from '@/lib/validation';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailValidation = useDebouncedFieldValidation(email, validateEmail);
  const passwordValidation = useDebouncedFieldValidation(password, (value) =>
    value ? undefined : 'Password is required',
  );

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    emailValidation.onBlur();
    passwordValidation.onBlur();

    if (validateEmail(email) || !password) {
      return;
    }

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
    <AuthShell
      className="max-w-md"
      title="Welcome back"
      description="Log in to continue your growth journey."
      footer={<AuthFooterLink prompt="Don't have an account?" linkText="Create one" to="/signup" />}
    >
      <form className="mt-8 space-y-4" onSubmit={submitLogin} noValidate>
        <Field id="login-email" label="Email" error={emailValidation.error}>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={emailValidation.onBlur}
            autoComplete="email"
            aria-invalid={emailValidation.isInvalid}
            className={fieldInputClassName(emailValidation.isInvalid)}
          />
        </Field>

        <Field id="login-password" label="Password" error={passwordValidation.error}>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={passwordValidation.onBlur}
            autoComplete="current-password"
            aria-invalid={passwordValidation.isInvalid}
            className={fieldInputClassName(passwordValidation.isInvalid)}
          />
        </Field>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitDisabled} className="w-full" size="lg">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  );
}

export default Login;
