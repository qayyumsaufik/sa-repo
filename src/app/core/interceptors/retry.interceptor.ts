import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retryWhen, take, concatMap, throwError, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't retry for POST, PUT, DELETE requests (idempotency concerns)
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retryWhen(errors =>
      errors.pipe(
        concatMap((error: HttpErrorResponse, index: number) => {
          // NEVER retry 401/403 errors - these indicate authentication/authorization failures
          // Retrying them causes infinite loops
          if (error.status === 401 || error.status === 403) {
            return throwError(() => error);
          }
          
          // Retry up to 3 times for network errors or 5xx errors
          if (index < 3 && (
            error.status === 0 || // Network error
            (error.status >= 500 && error.status < 600) // Server errors
          )) {
            // Exponential backoff: 1s, 2s, 4s
            const delayMs = Math.pow(2, index) * 1000;
            return timer(delayMs);
          }
          return throwError(() => error);
        }),
        take(4) // Initial attempt + 3 retries
      )
    )
  );
};
