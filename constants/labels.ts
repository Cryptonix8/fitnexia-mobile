/**
 * Textos de la interfaz — fuente única de etiquetas del producto.
 */
import type { ClassFormat, Modality } from '@/types/api';

export const BADGE_LABELS = {
  verified: 'Verificado',
  availableNow: 'Disponible ahora',
  full: 'Completo',
} as const;

export const CLASS_FORMAT_LABELS = {
  individual: '1 a 1',
  group: 'Grupal',
} as const;

export function resolveClassFormat(
  classFormat: ClassFormat | undefined,
  options?: { capacity?: number; hasInstitution?: boolean },
): ClassFormat {
  if (classFormat) return classFormat;
  if (options?.hasInstitution) return 'group';
  if (options?.capacity === 1) return 'individual';
  return 'group';
}

export function classFormatBadgeLabel(
  classFormat: ClassFormat | undefined,
  options?: { capacity?: number; hasInstitution?: boolean },
): string {
  const format = resolveClassFormat(classFormat, options);
  return CLASS_FORMAT_LABELS[format];
}

export function classFormatDescription(
  classFormat: ClassFormat | undefined,
  options?: { capacity?: number; hasInstitution?: boolean },
): string {
  const format = resolveClassFormat(classFormat, options);
  return format === 'individual'
    ? 'Sesión privada con un atleta.'
    : 'Sesión abierta para varios atletas.';
}

export const CLASS_CARD_LABELS = {
  spotsLeft: (count: number) => `${count} lugares disponibles`,
} as const;

export const MODALITY_LABELS = {
  online: 'En línea',
  inPerson: 'Presencial',
} as const;

export function modalityBadgeLabel(modality: Modality): string {
  return modality === 'online' ? MODALITY_LABELS.online : MODALITY_LABELS.inPerson;
}

export function modalityLocationLabel(modality: Modality, locationLabel?: string): string {
  if (modality === 'online') return MODALITY_LABELS.online;
  return locationLabel ?? MODALITY_LABELS.inPerson;
}

export const TAB_LABELS = {
  athlete: {
    home: 'Inicio',
    search: 'Buscar',
    bookings: 'Reservas',
    profile: 'Perfil',
  },
  instructor: {
    dashboard: 'Panel',
    classes: 'Clases',
    calendar: 'Calendario',
    earnings: 'Ingresos',
    profile: 'Perfil',
  },
  gym: {
    dashboard: 'Panel',
    staff: 'Equipo',
    classes: 'Clases',
    metrics: 'Métricas',
    profile: 'Gimnasio',
  },
} as const;

export const PROFILE_MENU_LABELS = {
  favoriteSports: 'Deportes favoritos',
  notifications: 'Notificaciones',
  paymentMethods: 'Métodos de pago',
  payoutAccount: 'Cuenta de cobros',
  planCommission: 'Plan y comisión',
  helpSupport: 'Ayuda y soporte',
  location: 'Ubicación',
  disciplines: 'Disciplinas',
  certifications: 'Certificaciones',
  scheduleAvailability: 'Horario y disponibilidad',
  photoGallery: 'Galería de fotos',
  instructors: 'Instructores',
} as const;

export const SCREEN_TITLES = {
  profile: 'Perfil',
  gymProfile: 'Perfil del gimnasio',
  editProfile: 'Editar perfil',
  notifications: 'Notificaciones',
  favoriteSports: 'Deportes favoritos',
  paymentMethods: 'Métodos de pago',
  payoutAccount: 'Cuenta de cobros',
  helpSupport: 'Ayuda y soporte',
  planCommission: 'Plan y comisión',
  inviteInstructor: 'Invitar instructor',
  class: 'Clase',
  classDetails: 'Detalles de la clase',
  classNotFound: 'Clase no encontrada',
} as const;

export const BUTTON_LABELS = {
  signOut: 'Cerrar sesión',
  save: 'Guardar',
  saveChanges: 'Guardar cambios',
  edit: 'Editar',
  continue: 'Continuar',
  createAccount: 'Crear cuenta',
  signIn: 'Iniciar sesión',
  bookNow: 'Reservar ahora',
  editClass: 'Editar clase',
  joinWaitlist: 'Unirse a lista de espera',
  joinWaitlistShort: 'Lista de espera',
  classFull: 'Clase completa',
  viewProfile: 'Perfil',
  confirmBooking: 'Confirmar reserva',
  payAndConfirm: 'Pagar y confirmar',
} as const;

export const CLASS_DETAIL_LABELS = {
  when: 'Cuándo',
  duration: 'Duración',
  where: 'Dónde',
  price: 'Precio',
  spots: 'Cupos',
  format: 'Tipo de clase',
  about: 'Acerca de',
  locationTbd: 'Por definir',
  full: 'Completo',
  fullWaitlist: 'Completo — lista de espera disponible',
  liveStream: 'Transmisión en vivo en Fitnexia',
  onlineSessionLink: 'Sesión en línea (enlace compartido después de reservar)',
} as const;

export function classSpotsLabel(
  spotsLeft: number,
  capacity: number,
  options?: { waitlistEnabled?: boolean },
): string {
  if (spotsLeft === 0) {
    return options?.waitlistEnabled
      ? CLASS_DETAIL_LABELS.fullWaitlist
      : CLASS_DETAIL_LABELS.full;
  }
  return `${spotsLeft} de ${capacity} disponibles`;
}

export const AUTH_LABELS = {
  welcomeBack: 'Bienvenido de nuevo',
  signInSubtitle: 'Iniciá sesión para continuar',
  continueWithGoogle: 'Continuar con Google',
  chooseProfile: 'Elegí tu perfil',
  createAccount: 'Crear cuenta',
  howWillYouUse: '¿Cómo vas a usar Fitnexia?',
  completeProfile: 'Completá tu perfil básico',
  gymSchoolName: 'Nombre del gimnasio / escuela',
  gymSchoolPlaceholder: 'Nombre de tu instalación',
  firstName: 'Nombre',
  lastName: 'Apellido',
  email: 'Email',
  password: 'Contraseña',
  logoPhoto: 'Logo / foto',
  profilePhoto: 'Foto de perfil',
} as const;

export const ALERT_LABELS = {
  signOutTitle: 'Cerrar sesión',
  signOutMessage: '¿Estás seguro?',
  cancel: 'Cancelar',
  missingInfoTitle: 'Faltan datos',
  fillAllFields: 'Completá todos los campos.',
  invalidEmail: 'Ingresá un email válido.',
  passwordMinLength: 'La contraseña debe tener al menos 8 caracteres.',
  gymNameRequired: 'El nombre del gimnasio / escuela es obligatorio.',
  savedTitle: 'Guardado',
  validationFailedTitle: 'Revisá los datos',
} as const;

export const ROLE_DESCRIPTIONS = {
  athlete: 'Encontrá y reservá clases cerca tuyo',
  instructor: 'Dictá clases y gestioná tu agenda',
  institution: 'Gestioná instructores y clases grupales',
  admin: '',
} as const;

export const GEO_LABELS = {
  nearMe: 'Cerca mío',
  listView: 'Lista',
  mapView: 'Mapa',
  youAreHere: 'Estás acá',
  locationHint: 'Ciudad, barrio o sede...',
  mapWebFallback: 'El mapa interactivo está disponible en iOS y Android.',
  noMapPins: 'Ninguna clase presencial con ubicación coincide con tus filtros.',
  enableNearMeHint: 'Activá Cerca mío para ver clases alrededor de tu ubicación.',
  locationDenied: 'Acceso a ubicación denegado. Activá el permiso en ajustes o buscá por zona.',
  withinRadius: (km: number) => `Dentro de ${km} km`,
} as const;

export const LOADING_LABELS = {
  default: 'Cargando…',
  classes: 'Cargando clases…',
  bookings: 'Cargando reservas…',
  instructor: 'Cargando instructor…',
  earnings: 'Cargando ingresos…',
  roster: 'Cargando instructores…',
  payment: 'Confirmando pago…',
  review: 'Verificando elegibilidad…',
  session: 'Cargando sesión…',
  passes: 'Cargando opciones de pago…',
  availability: 'Actualizando disponibilidad…',
} as const;
