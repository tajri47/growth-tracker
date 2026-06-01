import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AuthFooterLink, AuthShell } from '@/components/auth/AuthShell';
import { Field, fieldInputClassName } from '@/components/auth/Field';
import { PasswordRules } from '@/components/auth/PasswordRules';
import { Button } from '@/components/ui/button';
import { useDebouncedFieldValidation } from '@/hooks/useDebouncedFieldValidation';
import {
  buildDayOptions,
  isPasswordValid,
  validateBirthdate,
  validateEmail,
} from '@/lib/validation';
import { cn } from '@/lib/utils';

type Role = 'LEARNER' | 'MANAGER';
type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR';

interface AddressFormItem {
  id: string;
  isOpen: boolean;
  label: string;
  street1: string;
  street2: string;
  city: string;
  zipCode: string;
}

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations', 'HR', 'Other'] as const;

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const EXPERIENCE_OPTIONS: Array<{ value: ExperienceLevel; label: string; description: string; testId: string }> = [
  { value: 'JUNIOR', label: 'Junior', description: 'Early career and building strong fundamentals.', testId: 'experience-junior' },
  { value: 'MID', label: 'Mid', description: 'Comfortable owning tasks independently.', testId: 'experience-mid' },
  { value: 'SENIOR', label: 'Senior', description: 'Leads initiatives and mentors teammates.', testId: 'experience-senior' },
];

function makeAddress(): AddressFormItem {
  return {
    id: crypto.randomUUID(),
    isOpen: true,
    label: '',
    street1: '',
    street2: '',
    city: '',
    zipCode: '',
  };
}

function Signup() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('LEARNER');
  const [teamName, setTeamName] = useState('');
  const [department, setDepartment] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('JUNIOR');
  const [bio, setBio] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [addresses, setAddresses] = useState<AddressFormItem[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailValidation = useDebouncedFieldValidation(email, validateEmail);
  const passwordValidation = useDebouncedFieldValidation(password, (value) =>
    isPasswordValid(value) ? undefined : 'Password must meet all requirements below',
  );
  const teamNameValidation = useDebouncedFieldValidation(teamName, (value) => {
    if (role !== 'MANAGER') return undefined;
    if (!value.trim()) return 'Team name is required for managers';
    return undefined;
  });
  const departmentValidation = useDebouncedFieldValidation(department, (value) =>
    value ? undefined : 'Select a department',
  );
  const birthdateValidation = useDebouncedFieldValidation(
    { birthYear, birthMonth, birthDay },
    ({ birthYear: y, birthMonth: m, birthDay: d }) => validateBirthdate(y, m, d),
  );

  const years = useMemo(() => {
    const maxYear = currentYear - 10;
    const values: string[] = [];
    for (let year = maxYear; year >= 1940; year -= 1) {
      values.push(String(year));
    }
    return values;
  }, [currentYear]);

  const months = useMemo(
    () =>
      MONTH_LABELS.map((label, index) => ({
        label,
        value: String(index + 1).padStart(2, '0'),
      })),
    [],
  );

  const days = useMemo(() => buildDayOptions(birthYear, birthMonth), [birthYear, birthMonth]);

  useEffect(() => {
    if (!birthDay) return;
    if (!days.includes(birthDay)) {
      setBirthDay('');
    }
  }, [birthDay, days]);

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    if (nextRole === 'LEARNER') {
      setTeamName('');
    }
  }

  function handleBirthYearChange(value: string) {
    setBirthYear(value);
  }

  function handleBirthMonthChange(value: string) {
    setBirthMonth(value);
  }

  function addAddress() {
    setAddresses((prev) => [...prev, makeAddress()]);
  }

  function removeAddress(addressId: string) {
    setAddresses((prev) => prev.filter((item) => item.id !== addressId));
  }

  function toggleAddress(addressId: string) {
    setAddresses((prev) =>
      prev.map((item) => (item.id === addressId ? { ...item, isOpen: !item.isOpen } : item)),
    );
  }

  function updateAddress(addressId: string, field: keyof Omit<AddressFormItem, 'id' | 'isOpen'>, value: string) {
    setAddresses((prev) => prev.map((item) => (item.id === addressId ? { ...item, [field]: value } : item)));
  }

  const validateAllOnSubmit = useCallback(() => {
    emailValidation.onBlur();
    passwordValidation.onBlur();
    departmentValidation.onBlur();
    birthdateValidation.onBlur();
    if (role === 'MANAGER') teamNameValidation.onBlur();
  }, [birthdateValidation, departmentValidation, emailValidation, passwordValidation, role, teamNameValidation]);

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    validateAllOnSubmit();

    if (
      validateEmail(email) ||
      !isPasswordValid(password) ||
      !department ||
      validateBirthdate(birthYear, birthMonth, birthDay) ||
      (role === 'MANAGER' && !teamName.trim())
    ) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      email: email.trim(),
      password,
      role,
      department,
      experienceLevel,
      ...(role === 'MANAGER' && teamName.trim() ? { teamName: teamName.trim() } : {}),
      ...(bio.trim() ? { bio: bio.trim() } : {}),
      birthdate: `${birthYear}-${birthMonth}-${birthDay}`,
      addresses: addresses.map(({ label, street1, street2, city, zipCode }) => ({
        label: label.trim(),
        street1: street1.trim(),
        ...(street2.trim() ? { street2: street2.trim() } : {}),
        city: city.trim(),
        zipCode: Number(zipCode),
      })),
    };

    try {
      const response = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? 'Signup failed');
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

  const submitDisabled =
    isSubmitting ||
    !email.trim() ||
    !isPasswordValid(password) ||
    !department ||
    !birthYear ||
    !birthMonth ||
    !birthDay ||
    Boolean(validateBirthdate(birthYear, birthMonth, birthDay)) ||
    (role === 'MANAGER' && !teamName.trim());

  const selectClassName = (isInvalid: boolean) =>
    cn(fieldInputClassName(isInvalid), 'bg-background');

  return (
    <AuthShell
      className="max-w-4xl max-h-[95vh] overflow-y-auto"
      title="Create your account"
      description="Set up your profile to start tracking growth."
      footer={<AuthFooterLink prompt="Already have an account?" linkText="Log in" to="/login" />}
    >
      <form className="mt-8 space-y-8" data-testid="signup-form" onSubmit={submitSignup} noValidate>
        <section className="space-y-4">
          <Field id="signup-email" label="Email" error={emailValidation.error}>
            <input
              id="signup-email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={emailValidation.onBlur}
              autoComplete="email"
              aria-invalid={emailValidation.isInvalid}
              className={fieldInputClassName(emailValidation.isInvalid)}
            />
          </Field>

          <Field id="signup-password" label="Password" error={passwordValidation.error}>
            <input
              id="signup-password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={passwordValidation.onBlur}
              autoComplete="new-password"
              aria-invalid={passwordValidation.isInvalid}
              className={fieldInputClassName(passwordValidation.isInvalid)}
            />
            <PasswordRules password={password} />
          </Field>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-medium">Role</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="cursor-pointer rounded-lg border border-input px-3 py-2.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-muted">
              <input
                data-testid="role-learner"
                className="sr-only"
                type="radio"
                name="role"
                value="LEARNER"
                checked={role === 'LEARNER'}
                onChange={() => changeRole('LEARNER')}
              />
              Learner
            </label>
            <label className="cursor-pointer rounded-lg border border-input px-3 py-2.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-muted">
              <input
                data-testid="role-manager"
                className="sr-only"
                type="radio"
                name="role"
                value="MANAGER"
                checked={role === 'MANAGER'}
                onChange={() => changeRole('MANAGER')}
              />
              Manager
            </label>
          </div>

          {role === 'MANAGER' && (
            <Field id="team-name" label="Team name" error={teamNameValidation.error}>
              <input
                id="team-name"
                data-testid="team-name-input"
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                onBlur={teamNameValidation.onBlur}
                aria-invalid={teamNameValidation.isInvalid}
                className={fieldInputClassName(teamNameValidation.isInvalid)}
              />
            </Field>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field id="department" label="Department" error={departmentValidation.error}>
            <select
              id="department"
              data-testid="department-select"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              onBlur={departmentValidation.onBlur}
              aria-invalid={departmentValidation.isInvalid}
              className={selectClassName(departmentValidation.isInvalid)}
            >
              <option value="" disabled>
                Select department
              </option>
              {DEPARTMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <p className="text-sm font-medium mb-2">Experience level</p>
            <div className="space-y-2">
              {EXPERIENCE_OPTIONS.map((item) => (
                <label
                  key={item.value}
                  className="block rounded-lg border border-input px-3 py-2.5 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-muted"
                >
                  <input
                    data-testid={item.testId}
                    className="sr-only"
                    type="radio"
                    name="experienceLevel"
                    value={item.value}
                    checked={experienceLevel === item.value}
                    onChange={() => setExperienceLevel(item.value)}
                  />
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                </label>
              ))}
            </div>
          </div>
        </section>

        <Field id="bio" label="Bio (optional)">
          <textarea
            id="bio"
            data-testid="bio-input"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={250}
            rows={4}
            className={fieldInputClassName(false)}
          />
          <p className="text-xs text-muted-foreground mt-1.5" data-testid="bio-char-count">
            {bio.length} / 250
          </p>
        </Field>

        <div>
          <p className="text-sm font-medium mb-2">Birthdate</p>
          <div
            className="grid grid-cols-3 gap-3"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                birthdateValidation.onBlur();
              }
            }}
          >
            <select
              data-testid="birthdate-year"
              value={birthYear}
              onChange={(event) => handleBirthYearChange(event.target.value)}
              aria-invalid={birthdateValidation.isInvalid}
              className={selectClassName(birthdateValidation.isInvalid)}
            >
              <option value="" disabled>
                Year
              </option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              data-testid="birthdate-month"
              value={birthMonth}
              onChange={(event) => handleBirthMonthChange(event.target.value)}
              aria-invalid={birthdateValidation.isInvalid}
              className={selectClassName(birthdateValidation.isInvalid)}
            >
              <option value="" disabled>
                Month
              </option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              data-testid="birthdate-day"
              value={birthDay}
              onChange={(event) => setBirthDay(event.target.value)}
              disabled={!birthYear || !birthMonth}
              aria-invalid={birthdateValidation.isInvalid}
              className={selectClassName(birthdateValidation.isInvalid)}
            >
              <option value="" disabled>
                Day
              </option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          {birthdateValidation.error && (
            <p className="text-xs text-destructive mt-1.5" role="alert">
              {birthdateValidation.error}
            </p>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Addresses (optional)</p>
            <Button data-testid="add-address-btn" type="button" variant="outline" size="sm" onClick={addAddress}>
              Add an address
            </Button>
          </div>

          {addresses.map((address, index) => (
            <div key={address.id} data-testid="address-group" className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleAddress(address.id)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <ChevronDown
                    className={cn('size-4 transition-transform', address.isOpen && 'rotate-180')}
                    aria-hidden
                  />
                  Address {index + 1}
                </button>
                <button
                  data-testid="remove-address-btn"
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  className="text-sm text-destructive hover:text-destructive/80"
                >
                  Remove
                </button>
              </div>

              <div className={address.isOpen ? 'p-3 grid grid-cols-1 md:grid-cols-2 gap-3' : 'hidden'}>
                <input
                  data-testid="address-label-input"
                  type="text"
                  placeholder="Label (e.g. Home)"
                  value={address.label}
                  onChange={(event) => updateAddress(address.id, 'label', event.target.value)}
                  className={fieldInputClassName(false)}
                />
                <input
                  data-testid="address-street1-input"
                  type="text"
                  placeholder="Street 1"
                  value={address.street1}
                  onChange={(event) => updateAddress(address.id, 'street1', event.target.value)}
                  className={fieldInputClassName(false)}
                />
                <input
                  type="text"
                  placeholder="Street 2 (optional)"
                  value={address.street2}
                  onChange={(event) => updateAddress(address.id, 'street2', event.target.value)}
                  className={fieldInputClassName(false)}
                />
                <input
                  data-testid="address-city-input"
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(event) => updateAddress(address.id, 'city', event.target.value)}
                  className={fieldInputClassName(false)}
                />
                <input
                  data-testid="address-zip-input"
                  type="number"
                  placeholder="ZIP code"
                  value={address.zipCode}
                  onChange={(event) => updateAddress(address.id, 'zipCode', event.target.value)}
                  className={fieldInputClassName(false)}
                />
              </div>
            </div>
          ))}
        </section>

        {error && (
          <p data-testid="error-message" className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button data-testid="submit-btn" type="submit" disabled={submitDisabled} className="w-full" size="lg">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}

export default Signup;
