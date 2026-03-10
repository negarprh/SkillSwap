import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/api.model';

export const extractErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const payload = error.error as ApiErrorResponse | string | null;

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};

