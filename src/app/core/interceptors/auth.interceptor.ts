import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, catchError, take, retryWhen } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../../environments/environment';

/**
 * Auth Interceptor to ensure Auth0 access token is attached to API requests
 * 
 * FIX: Handles token refresh properly by:
 * 1. Getting tokens with default cache (SDK handles refresh automatically)
 * 2. If token retrieval fails, error interceptor will retry with cacheMode: 'off'
 * 3. This ensures expired tokens are refreshed using refresh tokens
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests to our API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Skip if this is a retry attempt from error interceptor (it already has a fresh token)
  if (req.headers.has('X-Retry-Attempt')) {
    return next(req);
  }

  // Inject services at the top level (within injection context)
  const auth0 = inject(AuthService);
  const logger = inject(LoggerService);
  
  // Check if user is authenticated first
  return auth0.isAuthenticated$.pipe(
    take(1),
    switchMap(isAuthenticated => {
      if (environment.enableDebugMode) {
        console.log('[Auth Interceptor] URL:', req.url.split('?')[0], '| Authenticated:', isAuthenticated);
      }
      
      if (!isAuthenticated) {
        // User not authenticated - proceed without token (backend will handle auth)
        if (environment.enableDebugMode) {
          console.log('[Auth Interceptor] User not authenticated, proceeding without token');
        }
        return next(req);
      }
      
      // User is authenticated - get a token
      // The SDK with useRefreshTokens: true should automatically refresh expired tokens
      // If it doesn't work, we'll get 401 and error interceptor will force refresh
      return auth0.getAccessTokenSilently({
        authorizationParams: {
          audience: environment.auth0.audience
        }
        // Using default cache mode - SDK should refresh expired tokens automatically
      }).pipe(
        // Retry up to 3 times with exponential backoff if token retrieval fails
        retryWhen(errors => 
          errors.pipe(
            switchMap((error, index) => {
              // Don't retry on consent errors - these require user interaction
              if (error?.message?.includes('Consent required')) {
                return throwError(() => error);
              }
              // Retry up to 3 times with increasing delay (500ms, 1s, 2s)
              if (index < 3) {
                const delayMs = Math.min(500 * Math.pow(2, index), 2000);
                return timer(delayMs);
              }
              return throwError(() => error);
            })
          )
        ),
        switchMap(token => {
          if (!token) {
            // CRITICAL FIX: If token is null, send request without token
            // Backend will return 401, then error interceptor will handle token refresh
            logger.errorWithPrefix('Auth Interceptor', 'Token is null - sending request without token (backend will return 401)', { url: req.url });
            if (environment.enableDebugMode) {
              console.warn('[Auth Interceptor] WARNING: Sending request without token:', req.url);
            }
            // Send request without token - backend will return 401, error interceptor will handle refresh
            return next(req);
          }
          
          if (environment.enableDebugMode) {
            console.log('[Auth Interceptor] Token attached to:', req.url.split('?')[0], '| Token length:', token.length);
          }
          
          // Attach token to request
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          
          return next(cloned);
        }),
        catchError((error) => {
          // CRITICAL FIX: If token retrieval fails, send request without token
          // Backend will return 401, then error interceptor will attempt token refresh
          // Only log unexpected errors (not consent or auth flow errors)
          if (!error?.message?.includes('Consent required') && 
              !(error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403))) {
            logger.errorWithPrefix('Auth Interceptor', 'Failed to retrieve token - sending request without token', {
              error: error.message || error,
              url: req.url
            });
          }
          if (environment.enableDebugMode) {
            console.warn('[Auth Interceptor] Token retrieval failed, sending request without token:', req.url);
          }
          // Send request without token - backend will return 401, error interceptor will handle refresh
          return next(req);
        })
      );
    }),
    catchError((error) => {
      // Error checking authentication status
      if (!(error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403))) {
        if (!error?.message?.includes('Consent required')) {
          logger.errorWithPrefix('Auth Interceptor', 'Error checking authentication status', error);
        }
      }
      // If there's an error checking auth status, send request without token
      // Backend will handle authentication check
      if (environment.enableDebugMode) {
        console.warn('[Auth Interceptor] Error checking auth status, sending request without token:', req.url);
      }
      return next(req);
    })
  );
};
