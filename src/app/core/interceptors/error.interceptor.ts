import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@auth0/auth0-angular';
import { catchError, switchMap, take, throwError, of, shareReplay, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Global token refresh lock to prevent multiple simultaneous refresh attempts
let tokenRefreshInProgress: Observable<string> | null = null;
let lastRefreshError: { timestamp: number; error: any } | null = null;
const REFRESH_ERROR_COOLDOWN = 5000; // Don't retry refresh for 5 seconds after a failure

/**
 * Error Interceptor to handle HTTP errors and display user-friendly messages.
 * FIX: Handles 401 errors by retrying the request with a fresh token when user is authenticated.
 * Uses a global lock to prevent multiple simultaneous token refresh attempts.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests to our API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const messageService = inject(MessageService);
  const authService = inject(AuthService);
  
  // Check if this request has already been retried (using a custom header)
  const hasRetried = req.headers.has('X-Retry-Attempt');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Check if user is authenticated - if authenticated but got 401, token may be expired
        return authService.isAuthenticated$.pipe(
          take(1),
          switchMap(isAuthenticated => {
            if (isAuthenticated && !hasRetried) {
              // User is authenticated but got 401 - token expired
              // FIX: Use a global lock to prevent multiple simultaneous token refresh attempts
              
              // Check if we recently failed to refresh (cooldown period)
              if (lastRefreshError && Date.now() - lastRefreshError.timestamp < REFRESH_ERROR_COOLDOWN) {
                // Too soon after last failure, don't retry
                messageService.add({
                  severity: 'warn',
                  summary: 'Authentication Required',
                  detail: 'Your session has expired. Please log in again.',
                  life: 5000
                });
                return throwError(() => error);
              }
              
              // If a refresh is already in progress, reuse it
              if (!tokenRefreshInProgress) {
                // Start a new token refresh
                tokenRefreshInProgress = authService.getAccessTokenSilently({
                  authorizationParams: {
                    audience: environment.auth0.audience
                  },
                  cacheMode: 'off' // Force token refresh - bypass cache completely
                }).pipe(
                  take(1),
                  shareReplay(1),
                  catchError(err => {
                    tokenRefreshInProgress = null;
                    lastRefreshError = { timestamp: Date.now(), error: err };
                    return throwError(() => err);
                  })
                );
              }
              
              return tokenRefreshInProgress.pipe(
                switchMap(token => {
                  // Clear the lock on success
                  tokenRefreshInProgress = null;
                  lastRefreshError = null;
                  
                  if (!token) {
                    // If we can't get a fresh token, refresh token may have expired
                    messageService.add({
                      severity: 'warn',
                      summary: 'Authentication Required',
                      detail: 'Your session has expired. Please log in again.',
                      life: 5000
                    });
                    return throwError(() => error);
                  }
                  
                  // Retry the original request with the fresh token
                  // Mark this as a retry attempt to prevent infinite loops
                  const cloned = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${token}`,
                      'X-Retry-Attempt': 'true'
                    }
                  });
                  return next(cloned);
                }),
                catchError(() => {
                  // If token refresh fails, show error
                  messageService.add({
                    severity: 'warn',
                    summary: 'Authentication Required',
                    detail: 'Your session has expired. Please log in again.',
                    life: 5000
                  });
                  return throwError(() => error);
                })
              );
            } else if (isAuthenticated && hasRetried) {
              // Already retried once, token refresh didn't help - show error
              messageService.add({
                severity: 'warn',
                summary: 'Authentication Required',
                detail: 'Your session has expired. Please log in again.',
                life: 5000
              });
              return throwError(() => error);
            } else {
              // If not authenticated, 401 is expected during auth flow - don't show error
              return throwError(() => error);
            }
          })
        );
      }
      // Handle 403 Forbidden errors
      else if (error.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'You do not have permission to perform this action.',
          life: 5000
        });
      }
      // Handle 500+ server errors
      else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'Server Error',
          detail: 'An error occurred on the server. Please try again later.',
          life: 5000
        });
      }
      // Handle network errors
      else if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Network Error',
          detail: 'Unable to connect to the server. Please check your connection.',
          life: 5000
        });
      }

      // Re-throw error so calling code can handle it
      return throwError(() => error);
    })
  );
};
