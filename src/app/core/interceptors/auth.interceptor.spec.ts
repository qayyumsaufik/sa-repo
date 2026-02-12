import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { LoggerService } from '../services/logger.service';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let auth0: jasmine.SpyObj<AuthService>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    auth0 = jasmine.createSpyObj<AuthService>('AuthService', ['getAccessTokenSilently'], {
      isAuthenticated$: of(true)
    });
    logger = jasmine.createSpyObj<LoggerService>('LoggerService', ['errorWithPrefix']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth0 },
        { provide: LoggerService, useValue: logger }
      ]
    });
  });

  it('should pass through non-api requests', (done) => {
    const req = new HttpRequest('GET', 'https://example.com/data');
    const next = jasmine.createSpy('next').and.callFake((request: HttpRequest<any>) => {
      expect(request).toBe(req);
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should attach access token for api requests', (done) => {
    auth0.getAccessTokenSilently.and.returnValue(of('token'));
    const req = new HttpRequest('GET', `${environment.apiUrl}/items`);
    const next = jasmine.createSpy('next').and.callFake((request: HttpRequest<any>) => {
      expect(request.headers.get('Authorization')).toBe('Bearer token');
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should not log 401 errors from token retrieval', (done) => {
    auth0.getAccessTokenSilently.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const req = new HttpRequest('GET', `${environment.apiUrl}/items`);
    const next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse({ status: 200 })));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(logger.errorWithPrefix).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
