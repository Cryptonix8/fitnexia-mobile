/** Default money currency — must match Mercado Pago account country (UY → UYU). */
export const DEFAULT_CURRENCY =
  process.env.EXPO_PUBLIC_DEFAULT_CURRENCY?.trim().toUpperCase() || 'UYU';
