import { HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  it('should pass through non-GET requests', (done) => {
    const req = new HttpRequest('POST', '/items', {});
    const next = jasmine.createSpy('next').and.returnValue(of(new HttpResponse({ status: 200 })));

    retryInterceptor(req, next).subscribe(() => {
      expect(next).toHaveBeenCalledWith(req);
      done();
    });
  });

  it('should surface non-retriable errors for GET', (done) => {
    const req = new HttpRequest('GET', '/items');
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    retryInterceptor(req, next).subscribe({
      next: () => fail('Expected error'),
      error: err => {
        expect(err.status).toBe(400);
        done();
      }
    });
  });
});
