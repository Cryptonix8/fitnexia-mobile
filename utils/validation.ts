import type { UserRole } from '@/types/api';

import { DISCIPLINES } from '@/constants/fitnexia';

export type ValidationError = { field: string; message: string };

export type ValidationResult = { ok: true } | { ok: false; message: string; errors: ValidationError[] };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\p{M}'\-\s.]{1,50}$/u;
const INSTITUTION_NAME_REGEX = /^[\p{L}\p{M}0-9'\-\s.&]{2,100}$/u;
const DISPLAY_NAME_REGEX = /^[\p{L}\p{M}0-9'\-\s.]{2,100}$/u;
const COUNTRY_REGEX = /^[A-Z]{2}$/;

export const VALIDATION_LIMITS = {
  passwordMin: 8,
  passwordMax: 128,
  bio: 2000,
  description: 2000,
  address: 200,
  city: 100,
  hourlyRateMax: 10000,
} as const;

function fail(errors: ValidationError[]): ValidationResult {
  return { ok: false, message: errors[0]?.message ?? 'Validation failed', errors };
}

function ok(): ValidationResult {
  return { ok: true };
}

function collect(checks: Array<() => ValidationError | null>): ValidationError[] {
  return checks.map((check) => check()).filter((err): err is ValidationError => err !== null);
}

export function validateEmail(email: string, required = true): ValidationError | null {
  const value = email.trim();
  if (!value) return required ? { field: 'email', message: 'Email is required' } : null;
  if (value.length > 254) return { field: 'email', message: 'Email is too long' };
  if (!EMAIL_REGEX.test(value)) return { field: 'email', message: 'Enter a valid email address' };
  return null;
}

export function validatePassword(password: string, required = true): ValidationError | null {
  if (!password) return required ? { field: 'password', message: 'Password is required' } : null;
  if (password.length < VALIDATION_LIMITS.passwordMin) {
    return { field: 'password', message: `Password must be at least ${VALIDATION_LIMITS.passwordMin} characters` };
  }
  if (password.length > VALIDATION_LIMITS.passwordMax) {
    return { field: 'password', message: `Password must be at most ${VALIDATION_LIMITS.passwordMax} characters` };
  }
  return null;
}

export function validateFirstName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'firstName', message: 'First name is required' } : null;
  if (!NAME_REGEX.test(value)) return { field: 'firstName', message: 'First name must be 1–50 letters' };
  return null;
}

export function validateLastName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'lastName', message: 'Last name is required' } : null;
  if (!NAME_REGEX.test(value)) return { field: 'lastName', message: 'Last name must be 1–50 letters' };
  return null;
}

export function validateInstitutionName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'institutionName', message: 'Gym / school name is required' } : null;
  if (!INSTITUTION_NAME_REGEX.test(value)) {
    return { field: 'institutionName', message: 'Gym / school name must be 2–100 characters' };
  }
  return null;
}

export function validateDisplayName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'displayName', message: 'Display name is required' } : null;
  if (!DISPLAY_NAME_REGEX.test(value)) {
    return { field: 'displayName', message: 'Display name must be 2–100 characters' };
  }
  return null;
}

export function validateBio(bio: string): ValidationError | null {
  if (bio.length > VALIDATION_LIMITS.bio) {
    return { field: 'bio', message: `Bio must be at most ${VALIDATION_LIMITS.bio} characters` };
  }
  return null;
}

export function validateDescription(description: string): ValidationError | null {
  if (description.length > VALIDATION_LIMITS.description) {
    return { field: 'description', message: `Description must be at most ${VALIDATION_LIMITS.description} characters` };
  }
  return null;
}

export function validateCountry(country: string): ValidationError | null {
  if (!country.trim()) return null;
  const value = country.trim().toUpperCase();
  if (!COUNTRY_REGEX.test(value)) {
    return { field: 'country', message: 'Country must be a 2-letter code (e.g. AR)' };
  }
  return null;
}

export function validateHourlyRate(rate: string): ValidationError | null {
  if (!rate.trim()) return null;
  const amount = parseFloat(rate);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { field: 'hourlyRate', message: 'Hourly rate must be a positive number' };
  }
  if (amount > VALIDATION_LIMITS.hourlyRateMax) {
    return { field: 'hourlyRate', message: `Hourly rate must be at most ${VALIDATION_LIMITS.hourlyRateMax}` };
  }
  return null;
}

export function validateDisciplines(list: string[]): ValidationError | null {
  const invalid = list.filter((item) => !DISCIPLINES.includes(item));
  if (invalid.length) return { field: 'disciplines', message: 'Invalid discipline selected' };
  return null;
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors = collect([
    () => validateEmail(email),
    () => (password ? null : { field: 'password', message: 'Password is required' }),
  ]);
  return errors.length ? fail(errors) : ok();
}

export function validateRegisterForm(params: {
  role: UserRole;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionName?: string;
  favoriteSports?: string[];
  disciplines?: string[];
}): ValidationResult {
  const errors = collect([
    () => validateEmail(params.email),
    () => validatePassword(params.password),
    () => validateFirstName(params.firstName),
    () => validateLastName(params.lastName),
    () =>
      params.role === 'institution'
        ? validateInstitutionName(params.institutionName ?? '', true)
        : null,
    () => validateDisciplines(params.favoriteSports ?? []),
    () => validateDisciplines(params.disciplines ?? []),
  ]);
  return errors.length ? fail(errors) : ok();
}

export function validateAthleteProfileForm(params: {
  firstName: string;
  lastName: string;
  email: string;
}): ValidationResult {
  const errors = collect([
    () => validateFirstName(params.firstName),
    () => validateLastName(params.lastName),
    () => validateEmail(params.email),
  ]);
  return errors.length ? fail(errors) : ok();
}

export function validateInstructorProfileForm(params: {
  displayName: string;
  email: string;
  bio: string;
  hourlyRate: string;
}): ValidationResult {
  const errors = collect([
    () => validateDisplayName(params.displayName),
    () => validateEmail(params.email),
    () => validateBio(params.bio),
    () => validateHourlyRate(params.hourlyRate),
  ]);
  return errors.length ? fail(errors) : ok();
}

export function validateInstitutionProfileForm(params: {
  name: string;
  email: string;
  description: string;
  address: string;
  city: string;
  country: string;
}): ValidationResult {
  const errors = collect([
    () => validateInstitutionName(params.name),
    () => validateEmail(params.email),
    () => validateDescription(params.description),
    () => validateCountry(params.country),
    () =>
      params.address.length > VALIDATION_LIMITS.address
        ? { field: 'address', message: `Address must be at most ${VALIDATION_LIMITS.address} characters` }
        : null,
    () =>
      params.city.length > VALIDATION_LIMITS.city
        ? { field: 'city', message: `City must be at most ${VALIDATION_LIMITS.city} characters` }
        : null,
  ]);
  return errors.length ? fail(errors) : ok();
}
