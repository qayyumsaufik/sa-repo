import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build URL and pass query params', () => {
    const expectedUrl = `${environment.apiUrl}/test`;

    service.get('test', { page: 1, active: true, empty: null, skip: undefined }).subscribe();

    const req = httpMock.expectOne(request => request.url === expectedUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('active')).toBe('true');
    expect(req.request.params.has('empty')).toBeFalse();
    expect(req.request.params.has('skip')).toBeFalse();
    req.flush({});
  });

  it('should serialize date params as ISO strings', () => {
    const expectedUrl = `${environment.apiUrl}/test`;
    const date = new Date('2025-01-01T12:34:56.000Z');

    service.get('test', { startDate: date }).subscribe();

    const req = httpMock.expectOne(request => request.url === expectedUrl);
    expect(req.request.params.get('startDate')).toBe(date.toISOString());
    req.flush({});
  });

  it('should post data', () => {
    const body = { name: 'Test' };
    service.post('items', body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should put data', () => {
    const body = { name: 'Updated' };
    service.put('items/1', body).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/items/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('should delete data', () => {
    service.delete('items/1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/items/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
