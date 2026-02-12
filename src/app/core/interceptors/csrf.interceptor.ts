import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * CSRF Token Interceptor
 * Implements double-submit cookie pattern for CSRF protection
 * Reads XSRF-TOKEN cookie and sends it in X-CSRF-Token header
 * 
 * Note: Backend skips CSRF validation if valid JWT is present in Authorization header.
 * This interceptor adds CSRF token as a fallback for cases where JWT might be missing or invalid.
 * The primary authentication should be via JWT (handled by authInterceptor).
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add CSRF token for API requests
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Only add CSRF token for state-changing operations
  const method = req.method.toUpperCase();
  const isStateChanging = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
  
  if (!isStateChanging) {
    return next(req);
  }

  // Read CSRF token from cookie
  const csrfToken = getCookie('XSRF-TOKEN');
  
  if (csrfToken) {
    // Clone request and add CSRF token header
    req = req.clone({
      setHeaders: {
        'X-CSRF-Token': csrfToken
      }
    });
  }
  // Note: If CSRF token is not available, we still proceed with the request.
  // The backend will:
  // 1. Skip CSRF check if valid JWT is in Authorization header (handled by authInterceptor)
  // 2. Return 403 if JWT is missing/invalid AND CSRF token is missing

  return next(req);
};

// Helper function to read cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}
