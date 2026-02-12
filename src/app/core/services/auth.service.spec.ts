import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, SyncUserResponse } from './auth.service';
import { ApiService } from './api.service';
import { PermissionService } from './permission.service';
import { LoggerService } from './logger.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

describe('AuthService', () => {
  let service: AuthService;
  let auth0: jasmine.SpyObj<Auth0Service>;
  let apiService: jasmine.SpyObj<ApiService>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    auth0 = jasmine.createSpyObj<Auth0Service>('Auth0Service', ['loginWithRedirect', 'logout', 'getAccessTokenSilently'], {
      isAuthenticated$: of(true),
      user$: of({
        sub: 'google-oauth2|123',
        name: 'Test User',
        email: 'test@example.com'
      })
    });
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
    permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['clearPermissions']);
    logger = jasmine.createSpyObj<LoggerService>('LoggerService', ['errorWithPrefix']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth0Service, useValue: auth0 },
        { provide: ApiService, useValue: apiService },
        { provide: PermissionService, useValue: permissionService },
        { provide: LoggerService, useValue: logger }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delegate login to auth0', () => {
    service.login();
    expect(auth0.loginWithRedirect).toHaveBeenCalled();
  });

  it('should clear permissions and logout', () => {
    service.logout();
    expect(permissionService.clearPermissions).toHaveBeenCalled();
    expect(auth0.logout).toHaveBeenCalled();
  });

  it('should return access token when available', done => {
    auth0.getAccessTokenSilently.and.returnValue(of('token'));

    service.accessToken$.subscribe(token => {
      expect(token).toBe('token');
      done();
    });
  });

  it('should return null on consent error', done => {
    auth0.getAccessTokenSilently.and.returnValue(throwError(() => ({ message: 'Consent required' })));

    service.accessToken$.subscribe(token => {
      expect(token).toBeNull();
      expect(logger.errorWithPrefix).not.toHaveBeenCalled();
      done();
    });
  });

  it('should sync user and return response', done => {
    const response: SyncUserResponse = {
      userId: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['Admin'],
      permissions: ['View'],
      isNewUser: false
    };
    auth0.getAccessTokenSilently.and.returnValue(of('token'));
    apiService.post.and.returnValue(of(response));

    service.syncUser().subscribe(result => {
      expect(result).toEqual(response);
      expect(apiService.post).toHaveBeenCalledWith('auth/sync', jasmine.any(Object));
      done();
    });
  });

  it('should surface 401 errors from sync', done => {
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    auth0.getAccessTokenSilently.and.returnValue(of('token'));
    apiService.post.and.returnValue(throwError(() => error));

    service.syncUser().subscribe({
      next: () => fail('Expected error'),
      error: err => {
        expect(err.status).toBe(401);
        done();
      }
    });
  });
});
