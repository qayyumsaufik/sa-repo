import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TenantService } from './tenant.service';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../../shared/models/tenant.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('TenantService', () => {
  let service: TenantService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TenantService]
    });
    service = TestBed.inject(TenantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch tenants with paging', () => {
    const mockTenants: PagedResult<Tenant> = {
      items: [
        { id: 1, name: 'Tenant 1', description: 'Desc', isActive: true, createdDate: '2024-01-01' }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getTenants(1, 10).subscribe(result => {
      expect(result).toEqual(mockTenants);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/tenant`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockTenants);
  });

  it('should fetch tenant by id', () => {
    const mockTenant: Tenant = {
      id: 5,
      name: 'Tenant 5',
      description: 'Desc',
      isActive: true,
      createdDate: '2024-01-01'
    };

    service.getTenantById(5).subscribe(result => {
      expect(result).toEqual(mockTenant);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tenant/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTenant);
  });

  it('should create a tenant', () => {
    const request: CreateTenantRequest = {
      name: 'New Tenant',
      description: 'Desc',
      isActive: true
    };
    const mockTenant: Tenant = {
      id: 10,
      name: 'New Tenant',
      description: 'Desc',
      isActive: true,
      createdDate: '2024-01-01'
    };

    service.createTenant(request).subscribe(result => {
      expect(result).toEqual(mockTenant);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tenant`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockTenant);
  });

  it('should update a tenant', () => {
    const request: UpdateTenantRequest = {
      id: 1,
      name: 'Updated Tenant',
      description: 'Desc',
      isActive: false
    };
    const mockTenant: Tenant = {
      id: 1,
      name: 'Updated Tenant',
      description: 'Desc',
      isActive: false,
      createdDate: '2024-01-01',
      lastModifiedDate: '2024-01-02'
    };

    service.updateTenant(request).subscribe(result => {
      expect(result).toEqual(mockTenant);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tenant/${request.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockTenant);
  });

  it('should delete a tenant', () => {
    service.deleteTenant(3).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tenant/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
