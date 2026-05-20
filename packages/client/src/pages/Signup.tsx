import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
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
    () => Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')),
    [],
  );

  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0')), []);

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    if (nextRole === 'LEARNER') {
      setTeamName('');
    }
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

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
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
    !password ||
    !department ||
    !birthYear ||
    !birthMonth ||
    !birthDay ||
    (role === 'MANAGER' && !teamName.trim());

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-neutral-200 rounded-xl shadow-sm p-6 md:p-8 max-h-[95vh] overflow-y-auto">
      <h1 className="font-semibold text-2xl text-neutral-900">Create your account</h1>
      <p className="text-sm text-neutral-600 mt-1">Set up your profile to start tracking growth.</p>

      <form className="mt-6 space-y-6" data-testid="signup-form" onSubmit={submitSignup}>
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <ul className="mt-2 text-sm space-y-1">
              <li
                data-testid="password-rule-length"
                data-met={String(passwordRules.length)}
                className={passwordRules.length ? 'text-emerald-700' : 'text-neutral-500'}
              >
                At least 8 characters
              </li>
              <li
                data-testid="password-rule-upper"
                data-met={String(passwordRules.upper)}
                className={passwordRules.upper ? 'text-emerald-700' : 'text-neutral-500'}
              >
                At least one capital letter
              </li>
              <li
                data-testid="password-rule-special"
                data-met={String(passwordRules.special)}
                className={passwordRules.special ? 'text-emerald-700' : 'text-neutral-500'}
              >
                At least one special character
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-medium text-neutral-800">Role</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100">
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
            <label className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100">
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
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="team-name">
                Team name
              </label>
              <input
                id="team-name"
                data-testid="team-name-input"
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                required
              />
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              data-testid="department-select"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-neutral-400"
              required
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
          </div>

          <div>
            <p className="block text-sm font-medium text-neutral-800 mb-1">Experience level</p>
            <div className="space-y-2">
              {EXPERIENCE_OPTIONS.map((item) => (
                <label key={item.value} className="block rounded-md border border-neutral-300 px-3 py-2 cursor-pointer has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-100">
                  <input
                    data-testid={item.testId}
                    className="sr-only"
                    type="radio"
                    name="experienceLevel"
                    value={item.value}
                    checked={experienceLevel === item.value}
                    onChange={() => setExperienceLevel(item.value)}
                  />
                  <div className="text-sm font-medium text-neutral-900">{item.label}</div>
                  <div className="text-xs text-neutral-600">{item.description}</div>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section>
          <label className="block text-sm font-medium text-neutral-800 mb-1" htmlFor="bio">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            data-testid="bio-input"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={250}
            rows={4}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <p className="text-xs text-neutral-600 mt-1" data-testid="bio-char-count">
            {bio.length} / 250
          </p>
        </section>

        <section>
          <p className="text-sm font-medium text-neutral-800 mb-2">Birthdate</p>
          <div className="grid grid-cols-3 gap-3">
            <select
              data-testid="birthdate-year"
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-neutral-400"
              required
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
              onChange={(event) => setBirthMonth(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-neutral-400"
              required
            >
              <option value="" disabled>
                Month
              </option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              data-testid="birthdate-day"
              value={birthDay}
              onChange={(event) => setBirthDay(event.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-neutral-400"
              required
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
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-800">Addresses (optional)</p>
            <button
              data-testid="add-address-btn"
              type="button"
              onClick={addAddress}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
            >
              Add an address
            </button>
          </div>

          {addresses.map((address, index) => (
            <div key={address.id} data-testid="address-group" className="rounded-md border border-neutral-200">
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggleAddress(address.id)}
                  className="text-sm font-medium text-neutral-800"
                >
                  Address {index + 1} {address.isOpen ? '(-)' : '(+)'}
                </button>
                <button
                  data-testid="remove-address-btn"
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  className="text-sm text-red-600 hover:text-red-700"
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
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <input
                  data-testid="address-street1-input"
                  type="text"
                  placeholder="Street 1"
                  value={address.street1}
                  onChange={(event) => updateAddress(address.id, 'street1', event.target.value)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Street 2 (optional)"
                  value={address.street2}
                  onChange={(event) => updateAddress(address.id, 'street2', event.target.value)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <input
                  data-testid="address-city-input"
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(event) => updateAddress(address.id, 'city', event.target.value)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <input
                  data-testid="address-zip-input"
                  type="number"
                  placeholder="ZIP code"
                  value={address.zipCode}
                  onChange={(event) => updateAddress(address.id, 'zipCode', event.target.value)}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>
            </div>
          ))}
        </section>

        {error && (
          <p data-testid="error-message" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          data-testid="submit-btn"
          type="submit"
          disabled={submitDisabled}
          className="w-full rounded-md bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}

export default Signup;
