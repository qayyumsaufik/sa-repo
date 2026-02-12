import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, of, timer, throwError } from 'rxjs';
import { switchMap, take, catchError, retryWhen } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PermissionService } from './permission.service';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';

export interface SyncUserRequest {
  auth0Id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
}

export interface SyncUserResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isNewUser: boolean;
}

export interface Auth0User {
  sub?: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0 = inject(Auth0Service);
  private apiService = inject(ApiService);
  private permissionService = inject(PermissionService);
  private logger = inject(LoggerService);

  get isAuthenticated$(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }

  get user$(): Observable<Auth0User | null> {
    return this.auth0.user$ as Observable<Auth0User | null>;
  }

  get accessToken$(): Observable<string | null> {
    return this.auth0.getAccessTokenSilently().pipe(
      catchError((error) => {
        // Don't log consent errors - they're part of normal Auth0 flow
        // User will be redirected to consent screen automatically
        if (!error?.message?.includes('Consent required')) {
          this.logger.errorWithPrefix('Auth Service', 'Failed to get access token', error);
        }
        return of(null);
      })
    );
  }

  login(): void {
    this.auth0.loginWithRedirect();
  }

  logout(): void {
    this.permissionService.clearPermissions();
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  syncUser(): Observable<SyncUserResponse> {
    return this.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Extract provider from sub (e.g., "google-oauth2|123456" -> "google-oauth2")
        const auth0Id = user.sub || '';
        const provider = auth0Id.split('|')[0] || 'auth0';
        
        // Parse name
        const name = user.name || '';
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || user.given_name || '';
        const lastName = nameParts.slice(1).join(' ') || user.family_name || '';

        const request: SyncUserRequest = {
          auth0Id: auth0Id,
          email: user.email || '',
          firstName: firstName,
          lastName: lastName,
          provider: provider
        };
        
        // Explicitly get access token with audience before making the request
        // Retry with delay if token isn't immediately available (handles timing issues after login)
        // FIX: Removed cacheMode: 'on' to allow automatic token refresh when expired
        return this.auth0.getAccessTokenSilently({
          authorizationParams: {
            audience: environment.auth0.audience
          }
        }).pipe(
          // Retry up to 3 times with exponential backoff if token retrieval fails
          retryWhen(errors => 
            errors.pipe(
              switchMap((error, index) => {
                // Don't retry on consent errors - these require user interaction
                if (error?.message?.includes('Consent required')) {
                  return throwError(() => error);
                }
                // Don't retry on 401/403 - these indicate auth/authorization issues
                if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
                  return throwError(() => error);
                }
                // Retry up to 3 times with increasing delay (1s, 2s, 3s)
                if (index < 3) {
                  const delayMs = Math.min(1000 * (index + 1), 3000);
                  return timer(delayMs);
                }
                return throwError(() => error);
              })
            )
          ),
          switchMap((token) => {
            // Ensure we have a token before making the request
            if (!token) {
              throw new Error('Access token not available');
            }
            // Token is available - interceptor will attach it, but we've ensured it's ready
            return this.apiService.post<SyncUserResponse>('Auth/sync', request);
          }),
          catchError((tokenError) => {
            // Don't log consent errors - they're part of normal Auth0 flow
            // User will be redirected to consent screen automatically
            if (!tokenError?.message?.includes('Consent required')) {
              // Only log if it's not a 401/403 (those are expected during auth flow)
              if (!(tokenError instanceof HttpErrorResponse && (tokenError.status === 401 || tokenError.status === 403))) {
                this.logger.errorWithPrefix('Auth Service', 'Failed to get access token for sync', tokenError);
              }
            }
            // Don't proceed with request if token retrieval failed - throw the error
            throw tokenError;
          }),
          catchError(error => {
            // Don't log 401/403 errors - they're expected if user isn't authenticated, needs consent, or has authorization issues
            if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
              throw error;
            }
            this.logger.errorWithPrefix('Auth Service', 'Sync user API error', error);
            throw error;
          })
        );
      })
    );
  }
}
