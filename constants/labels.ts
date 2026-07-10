/**
 * Textos de la interfaz — fuente única de etiquetas del producto.
 */
import type { ClassFormat, Modality } from '@/types/api';

export const BADGE_LABELS = {
  verified: 'Verificado',
  availableNow: 'Disponible ahora',
  full: 'Completo',
  recurring: 'Recurrente',
} as const;

export const VERIFICATION_LABELS = {
  bannerTitle: 'Verificá tu perfil',
  bannerBody: 'Generá más confianza y destacá en los resultados con la insignia Fitnexia.',
  pendingTitle: 'Verificación en revisión',
  pendingBody: 'Recibimos tus documentos. Te avisaremos por email cuando haya novedades.',
  rejectedTitle: 'Verificación no aprobada',
  rejectedBody: 'Podés enviar una nueva solicitud con documentos actualizados.',
  pendingBadge: 'En revisión',
  rejectedBadge: 'No verificado',
  cta: 'Verificar',
  screenTitle: 'Verificar perfil',
  screenIntro:
    'Subí tu documento de identidad (frente y dorso) y un título o certificación profesional. Los documentos son privados y solo los ve el equipo Fitnexia.',
  dniFront: 'Documento de identidad — frente',
  dniBack: 'Documento de identidad — dorso',
  certification: 'Título o certificación profesional',
  uploadDoc: 'Subir archivo',
  changeDoc: 'Cambiar archivo',
  submit: 'Enviar solicitud',
  submittingOverlay: 'Enviando solicitud…',
  submittedTitle: 'Solicitud enviada',
  submittedBody: 'Recibimos tu solicitud. Te notificaremos por email cuando la revisemos.',
  missingDocs: 'Subí los tres documentos requeridos.',
  lastReason: 'Último motivo',
  verifiedOnly: 'Solo verificados',
  unverifiedPublishHint:
    'Tu perfil aún no está verificado. Podés publicar clases, pero no mostrarás la insignia Fitnexia.',
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
  spotsLeft: (count: number) => `Disponibles(${count})`,
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
  const translated = translateLocationLabel(locationLabel);
  return translated || MODALITY_LABELS.inPerson;
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
    members: 'Socios',
    metrics: 'Métricas',
    profile: 'Gimnasio',
  },
} as const;

export const NOTIFICATION_LABELS = {
  screenTitle: 'Notificaciones',
  emptyTitle: 'Sin notificaciones',
  emptyDescription: 'Cuando haya novedades sobre tus clases, reservas o perfil, las verás acá.',
  markAll: 'Marcar todas',
  seeMore: 'Ver {count} más',
  unreadOne: '1 sin leer',
  unreadMany: '{count} sin leer',
  deleteTitle: 'Eliminar notificación',
  deleteMessage: 'Esta acción no se puede deshacer.',
  deleteConfirm: 'Eliminar',
  cancel: 'Cancelar',
  preferencesTitle: 'Preferencias de alertas',
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
  clubMembership: 'Membresía del club',
  membershipPlans: 'Planes de cuota',
  gymSubscription: 'Plan Fitnexia',
  membershipSettings: 'Ajustes de cuotas',
  jobPostings: 'Ofertas de trabajo',
} as const;

export const MEMBERSHIP_LABELS = {
  feeUpToDate: 'Al día',
  feePending: 'Pendiente',
  feeOverdue: 'En mora',
  feeInactive: 'Inactivo',
  billingMonthly: 'Mensual',
  billingQuarterly: 'Trimestral',
  billingAnnual: 'Anual',
  inviteCode: 'Código de invitación',
  shareInvite: 'Compartir invitación',
  bulkInviteTitle: 'Carga masiva (CSV)',
  bulkInviteHint: 'Un socio por línea: email, nombre, teléfono. Podés pegar desde Excel.',
  bulkInvitePlaceholder: 'email,nombre,telefono\nsocio@mail.com,Ana,+59899111222',
  bulkInviteSubmit: 'Enviar invitaciones',
  bulkInviteResult: 'invitaciones creadas',
  bulkInviteFailed: 'filas con error',
  nextDue: 'Próximo vencimiento',
  amountDue: 'Saldo pendiente',
  payDebt: 'Pagar cuota',
  authorizeDebit: 'Autorizar débito',
  paymentApproved: 'Aprobado',
  paymentPending: 'Pendiente',
  paymentRejected: 'Rechazado',
  paymentRefunded: 'Reembolsado',
  graceDaysHint: 'Días de gracia del club',
  pendingActivation: 'se activará al autorizar el débito',
  noPaymentsUntilAuth: 'Sin pagos todavía. Autorizá el débito para registrar el primer cobro.',
  noPaymentsRecorded: 'Sin pagos registrados.',
  noMembers: 'Todavía no hay socios registrados',
  noPlans: 'Creá un plan de cuota para empezar',
  addMember: 'Agregar socio',
  editMember: 'Editar socio',
  editPlan: 'Editar plan',
  contactPhone: 'Teléfono',
  planIndividual: 'Individual',
  planFamily: 'Familiar',
  maxMembers: 'Máx. integrantes',
  description: 'Descripción',
  activePlans: 'Planes activos',
  inactivePlans: 'Planes inactivos',
  reactivate: 'Reactivar',
  deactivate: 'Desactivar',
  linkedToApp: 'Vinculado a la app',
  notLinkedToApp: 'Sin vincular a la app',
  linkedPendingAuth: 'Vinculado · falta autorizar débito',
  noMembershipsTitle: 'Sin membresías',
  noMembershipsHint:
    'Si tu club te registró como socio, el email debe coincidir con el de tu cuenta Fitnexia. Pedile al gimnasio que lo verifique o unite con un código de invitación.',
  membershipNotFoundTitle: 'Membresía no encontrada',
  membershipNotFoundHint:
    'No pudimos cargar esta membresía. Iniciá sesión con el mismo email que registró tu club o volvé a la lista.',
  addMemberEmailHint:
    'Usá el mismo email con el que el socio tiene cuenta en Fitnexia para que vea la membresía en la app.',
} as const;

export function memberAppLinkLabel(member: {
  userId?: string;
  status?: string;
}): string {
  if (member.userId) {
    if (member.status === 'pending_authorization') {
      return MEMBERSHIP_LABELS.linkedPendingAuth;
    }
    return MEMBERSHIP_LABELS.linkedToApp;
  }
  return MEMBERSHIP_LABELS.notLinkedToApp;
}

export function membershipPlanTypeLabel(planType: string): string {
  if (planType === 'family') return MEMBERSHIP_LABELS.planFamily;
  return MEMBERSHIP_LABELS.planIndividual;
}

export function membershipBillingLabel(frequency: string): string {
  if (frequency === 'quarterly') return MEMBERSHIP_LABELS.billingQuarterly;
  if (frequency === 'annual') return MEMBERSHIP_LABELS.billingAnnual;
  return MEMBERSHIP_LABELS.billingMonthly;
}

export function membershipFeeStatusLabel(status: string): string {
  if (status === 'up_to_date') return MEMBERSHIP_LABELS.feeUpToDate;
  if (status === 'overdue') return MEMBERSHIP_LABELS.feeOverdue;
  if (status === 'inactive') return MEMBERSHIP_LABELS.feeInactive;
  return MEMBERSHIP_LABELS.feePending;
}

export function membershipPaymentStatusLabel(status: string): string {
  if (status === 'approved') return MEMBERSHIP_LABELS.paymentApproved;
  if (status === 'rejected') return MEMBERSHIP_LABELS.paymentRejected;
  if (status === 'refunded') return MEMBERSHIP_LABELS.paymentRefunded;
  return MEMBERSHIP_LABELS.paymentPending;
}

export function formatMoney(money: { amount: number; currency: string }): string {
  return `${(money.amount / 100).toLocaleString('es-UY')} ${money.currency}`;
}

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
  joinLiveClass: 'Entrar a la clase en vivo',
  startLiveClass: 'Iniciar clase en vivo',
  editClass: 'Editar clase',
  joinWaitlist: 'Unirse a lista de espera',
  joinWaitlistShort: 'Lista de espera',
  classFull: 'Clase completa',
  viewProfile: 'Perfil',
  seeMore: 'Ver más',
  confirmBooking: 'Confirmar reserva',
  payAndConfirm: 'Pagar y confirmar',
  closeAccount: 'Cerrar cuenta',
} as const;

export const CLASS_DETAIL_LABELS = {
  when: 'Cuándo',
  duration: 'Duración',
  where: 'Dónde',
  price: 'Precio',
  spots: 'Cupos',
  format: 'Tipo de clase',
  level: 'Nivel',
  language: 'Idioma',
  instructorGender: 'Instructor',
  about: 'Acerca de',
  locationTbd: 'Por definir',
  full: 'Completo',
  fullWaitlist: 'Completo — lista de espera disponible',
  liveStream: 'Transmisión en vivo en Fitnexia',
  onlineSessionLink: 'Sesión en línea (enlace compartido después de reservar)',
} as const;

const CLASS_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  en: 'Inglés',
  pt: 'Portugués',
};

const INSTRUCTOR_GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiero no decir',
};

export function classLevelLabel(level?: string | null): string | undefined {
  if (!level) return undefined;
  return CLASS_LEVEL_LABELS[level] ?? level;
}

export function classLanguageLabel(language?: string | null): string | undefined {
  if (!language) return undefined;
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language;
}

export function instructorGenderLabel(gender?: string | null): string | undefined {
  if (!gender) return undefined;
  return INSTRUCTOR_GENDER_LABELS[gender] ?? gender;
}

export const CLASS_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
] as const;

export const CLASS_LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
] as const;

export const INSTRUCTOR_GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' },
] as const;

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
  sessionExpiredTitle: 'Sesión expirada',
  sessionExpiredMessage: 'Tu sesión venció por seguridad. Volvé a iniciar sesión para continuar.',
  continueWithGoogle: 'Continuar con Google',
  continueWithApple: 'Continuar con Apple',
  chooseProfile: 'Elegí tu perfil',
  createAccount: 'Crear cuenta',
  howWillYouUse: '¿Cómo vas a usar Fitnexia?',
  completeProfile: 'Completá tu perfil básico',
  gymSchoolName: 'Nombre del gimnasio / escuela',
  gymSchoolPlaceholder: 'Nombre de tu instalación',
  firstName: 'Nombre',
  lastName: 'Apellido',
  email: 'Correo electrónico',
  password: 'Contraseña',
  logoPhoto: 'Logo / foto',
  profilePhoto: 'Foto de perfil',
  bio: 'Biografía',
} as const;

export const PLAN_LABELS = {
  basic: 'Básico',
  pro: 'Pro',
  institutional: 'Institucional',
} as const;

export const GYM_TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export function formatGymTierSummary(tier: string, memberCount: number, memberLimit: number | null) {
  const name = GYM_TIER_LABELS[tier] ?? tier;
  if (memberLimit == null) return `${name} · ${memberCount} socios`;
  return `${name} · ${memberCount}/${memberLimit} socios`;
}

export const PLAN_COMMISSION_PERCENT: Record<keyof typeof PLAN_LABELS, number> = {
  basic: 10,
  pro: 8,
  institutional: 5,
};

export function formatPlanSummary(planId: keyof typeof PLAN_LABELS, commissionPercent: number): string {
  return `${PLAN_LABELS[planId] ?? planId} · ${commissionPercent}%`;
}

export function formatUserPlanSummary(planId: keyof typeof PLAN_LABELS): string {
  return formatPlanSummary(planId, PLAN_COMMISSION_PERCENT[planId] ?? 10);
}

/** Legacy English location labels from older catalog / staging data. */
const LEGACY_LOCATION_LABELS: Record<string, string> = {
  'Wellness Loft': 'Espacio Wellness',
  'Central Courts': 'Canchas Centrales',
  'FitHub Studio A': 'Sede FitHub — Sala A',
  'FitHub Downtown': 'Sede FitHub',
  FitHub: 'Sede FitHub',
};

export function translateLocationLabel(label?: string | null): string {
  if (!label?.trim()) return '';
  const trimmed = label.trim();
  return LEGACY_LOCATION_LABELS[trimmed] ?? trimmed;
}

/** Legacy English discipline names from older catalog / API data. */
const LEGACY_DISCIPLINE_LABELS: Record<string, string> = {
  CrossFit: 'Entrenamiento cross',
  Crossfit: 'Entrenamiento cross',
  'Indoor Cycling': 'Ciclismo indoor',
  'Pilates Mat/Reformer': 'Pilates suelo/reformer',
  Tennis: 'Tenis',
  Swimming: 'Natación',
  HIIT: 'Entrenamiento Funcional',
  Pilates: 'Pilates suelo/reformer',
  Boxing: 'Otros',
  Running: 'Otros',
  Padel: 'Pádel',
};

export function translateDisciplineLabel(discipline: string): string {
  return LEGACY_DISCIPLINE_LABELS[discipline] ?? discipline;
}

export function translateDisciplineLabels(disciplines: string[]): string[] {
  return disciplines.map(translateDisciplineLabel);
}

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
  closeAccountTitle: '¿Cerrar tu cuenta?',
  closeAccountMessage:
    'Se eliminarán tu perfil y todo el contenido asociado (clases, membresías, reservas, etc.). Esta acción no se puede deshacer.',
  closeAccountFailedTitle: 'No se pudo cerrar la cuenta',
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
  closingAccount: 'Cerrando cuenta…',
  signingOut: 'Cerrando sesión…',
} as const;
