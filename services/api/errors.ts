export class ApiError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    const errors = error.details?.errors as Array<{ message: string }> | undefined;
    if (Array.isArray(errors) && errors.length) {
      return errors.map((entry) => entry.message).join('\n');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
