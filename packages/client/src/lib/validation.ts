export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address';
  return undefined;
}

export function getPasswordRules(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const rules = getPasswordRules(password);
  return rules.length && rules.upper && rules.special;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function buildDayOptions(year: string, month: string): string[] {
  if (!year || !month) return [];
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) {
    return [];
  }
  const count = getDaysInMonth(yearNum, monthNum);
  return Array.from({ length: count }, (_, index) => String(index + 1).padStart(2, '0'));
}

export function isValidBirthdate(year: string, month: string, day: string): boolean {
  if (!year || !month || !day) return false;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);
  if (!Number.isFinite(yearNum) || !Number.isFinite(monthNum) || !Number.isFinite(dayNum)) {
    return false;
  }
  const date = new Date(yearNum, monthNum - 1, dayNum);
  return (
    date.getFullYear() === yearNum &&
    date.getMonth() === monthNum - 1 &&
    date.getDate() === dayNum
  );
}

export function validateBirthdate(year: string, month: string, day: string): string | undefined {
  if (!year || !month || !day) return 'Select your full birthdate';
  if (!isValidBirthdate(year, month, day)) return 'This date is not valid for the selected month';
  return undefined;
}
