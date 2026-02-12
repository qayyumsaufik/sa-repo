import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { LoggerService } from '../services/logger.service';
import { tenantInterceptor } from './tenant.interceptor';
import { environment } from '../../../environments/environment';

describe('tenantInterceptor', () => {
  let auth0: jasmine.SpyObj<AuthService>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    auth0 = jasmine.createSpyObj<AuthService>('AuthService', [], {
      user$: of({ tenantId: '123' })
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
      tenantInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should attach tenant header when claim is present', (done) => {
    const req = new HttpRequest('GET', `${environment.apiUrl}/items`);
    const next = jasmine.createSpy('next').and.callFake((request: HttpRequest<any>) => {
      expect(request.headers.get('X-Tenant-Id')).toBe('123');
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.runInInjectionContext(() => {
      tenantInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
    });
  });
});
