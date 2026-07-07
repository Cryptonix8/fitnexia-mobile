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
  return { ok: false, message: errors[0]?.message ?? 'Error de validación', errors };
}

function ok(): ValidationResult {
  return { ok: true };
}

function collect(checks: Array<() => ValidationError | null>): ValidationError[] {
  return checks.map((check) => check()).filter((err): err is ValidationError => err !== null);
}

export function validateEmail(email: string, required = true): ValidationError | null {
  const value = email.trim();
  if (!value) return required ? { field: 'email', message: 'El email es obligatorio' } : null;
  if (value.length > 254) return { field: 'email', message: 'El email es demasiado largo' };
  if (!EMAIL_REGEX.test(value)) return { field: 'email', message: 'Ingresá un email válido' };
  return null;
}

export function validatePassword(password: string, required = true): ValidationError | null {
  if (!password) return required ? { field: 'password', message: 'La contraseña es obligatoria' } : null;
  if (password.length < VALIDATION_LIMITS.passwordMin) {
    return { field: 'password', message: `La contraseña debe tener al menos ${VALIDATION_LIMITS.passwordMin} caracteres` };
  }
  if (password.length > VALIDATION_LIMITS.passwordMax) {
    return { field: 'password', message: `La contraseña debe tener como máximo ${VALIDATION_LIMITS.passwordMax} caracteres` };
  }
  return null;
}

export function validateFirstName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'firstName', message: 'El nombre es obligatorio' } : null;
  if (!NAME_REGEX.test(value)) return { field: 'firstName', message: 'El nombre debe tener 1–50 letras' };
  return null;
}

export function validateLastName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'lastName', message: 'El apellido es obligatorio' } : null;
  if (!NAME_REGEX.test(value)) return { field: 'lastName', message: 'El apellido debe tener 1–50 letras' };
  return null;
}

export function validateInstitutionName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'institutionName', message: 'El nombre del gimnasio / escuela es obligatorio' } : null;
  if (!INSTITUTION_NAME_REGEX.test(value)) {
    return { field: 'institutionName', message: 'El nombre debe tener entre 2 y 100 caracteres' };
  }
  return null;
}

export function validateDisplayName(name: string, required = true): ValidationError | null {
  const value = name.trim();
  if (!value) return required ? { field: 'displayName', message: 'El nombre para mostrar es obligatorio' } : null;
  if (!DISPLAY_NAME_REGEX.test(value)) {
    return { field: 'displayName', message: 'El nombre para mostrar debe tener entre 2 y 100 caracteres' };
  }
  return null;
}

export function validateBio(bio: string): ValidationError | null {
  if (bio.length > VALIDATION_LIMITS.bio) {
    return { field: 'bio', message: `La biografía debe tener como máximo ${VALIDATION_LIMITS.bio} caracteres` };
  }
  return null;
}

export function validateDescription(description: string): ValidationError | null {
  if (description.length > VALIDATION_LIMITS.description) {
    return { field: 'description', message: `La descripción debe tener como máximo ${VALIDATION_LIMITS.description} caracteres` };
  }
  return null;
}

export function validateCountry(country: string): ValidationError | null {
  if (!country.trim()) return null;
  const value = country.trim().toUpperCase();
  if (!COUNTRY_REGEX.test(value)) {
    return { field: 'country', message: 'El país debe ser un código de 2 letras (ej. AR)' };
  }
  return null;
}

export function validateHourlyRate(rate: string): ValidationError | null {
  if (!rate.trim()) return null;
  const amount = parseFloat(rate);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { field: 'hourlyRate', message: 'La tarifa por hora debe ser un número positivo' };
  }
  if (amount > VALIDATION_LIMITS.hourlyRateMax) {
    return { field: 'hourlyRate', message: `La tarifa por hora debe ser como máximo ${VALIDATION_LIMITS.hourlyRateMax}` };
  }
  return null;
}

export function validateDisciplines(list: string[]): ValidationError | null {
  const invalid = list.filter((item) => !DISCIPLINES.includes(item));
  if (invalid.length) return { field: 'disciplines', message: 'Disciplina seleccionada inválida' };
  return null;
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors = collect([
    () => validateEmail(email),
    () => (password ? null : { field: 'password', message: 'La contraseña es obligatoria' }),
  ]);
  return errors.length ? fail(errors) : ok();
}

export function validateForgotPasswordForm(email: string): ValidationResult {
  const errors = collect([() => validateEmail(email)]);
  return errors.length ? fail(errors) : ok();
}

export function validateResetPasswordForm(password: string, confirmPassword: string): ValidationResult {
  const errors = collect([
    () => validatePassword(password),
    () => {
      if (!confirmPassword) {
        return { field: 'confirmPassword', message: 'Confirmá tu contraseña' };
      }
      if (password !== confirmPassword) {
        return { field: 'confirmPassword', message: 'Las contraseñas no coinciden' };
      }
      return null;
    },
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
  gender?: string | null;
}): ValidationResult {
  const GENDER_VALUES = ['male', 'female', 'other', 'prefer_not_to_say'];
  const errors = collect([
    () => validateEmail(params.email),
    () => validatePassword(params.password),
    ...(params.role === 'institution'
      ? []
      : [
          () => validateFirstName(params.firstName),
          () => validateLastName(params.lastName),
        ]),
    () =>
      params.role === 'institution'
        ? validateInstitutionName(params.institutionName ?? '', true)
        : null,
    () => validateDisciplines(params.favoriteSports ?? []),
    () => validateDisciplines(params.disciplines ?? []),
    () => {
      if (params.role !== 'instructor') return null;
      if (!params.gender || !GENDER_VALUES.includes(params.gender)) {
        return { field: 'gender', message: 'Seleccioná tu género para continuar.' };
      }
      return null;
    },
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
        ? { field: 'address', message: `La dirección debe tener como máximo ${VALIDATION_LIMITS.address} caracteres` }
        : null,
    () =>
      params.city.length > VALIDATION_LIMITS.city
        ? { field: 'city', message: `La ciudad debe tener como máximo ${VALIDATION_LIMITS.city} caracteres` }
        : null,
  ]);
  return errors.length ? fail(errors) : ok();
}
