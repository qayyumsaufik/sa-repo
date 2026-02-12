import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SiteService } from './site.service';
import { Site, CreateSiteRequest, UpdateSiteRequest } from '../../../shared/models/site.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('SiteService', () => {
  let service: SiteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SiteService]
    });
    service = TestBed.inject(SiteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch sites with filters', () => {
    const mockSites: PagedResult<Site> = {
      items: [
        { id: 1, name: 'Site 1', zoneId: 2, zoneName: 'Zone', createdDate: '2024-01-01' }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getSites({ zoneId: 2, pageNumber: 1, pageSize: 10 }).subscribe(result => {
      expect(result).toEqual(mockSites);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/site`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('zoneId')).toBe('2');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockSites);
  });

  it('should fetch site by id', () => {
    const mockSite: Site = {
      id: 2,
      name: 'Site 2',
      zoneId: 1,
      zoneName: 'Zone',
      createdDate: '2024-01-01'
    };

    service.getSiteById(2).subscribe(result => {
      expect(result).toEqual(mockSite);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/site/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSite);
  });

  it('should create a site', () => {
    const request: CreateSiteRequest = { name: 'New Site', zoneId: 1, latitude: 1.1, longitude: 2.2 };
    const mockSite: Site = {
      id: 3,
      name: 'New Site',
      zoneId: 1,
      zoneName: 'Zone',
      latitude: 1.1,
      longitude: 2.2,
      createdDate: '2024-01-01'
    };

    service.createSite(request).subscribe(result => {
      expect(result).toEqual(mockSite);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/site`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockSite);
  });

  it('should update a site', () => {
    const request: UpdateSiteRequest = { id: 4, name: 'Updated Site', zoneId: 2, latitude: 3.3, longitude: 4.4 };
    const mockSite: Site = {
      id: 4,
      name: 'Updated Site',
      zoneId: 2,
      zoneName: 'Zone',
      latitude: 3.3,
      longitude: 4.4,
      createdDate: '2024-01-01',
      lastModifiedDate: '2024-01-02'
    };

    service.updateSite(request).subscribe(result => {
      expect(result).toEqual(mockSite);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/site/${request.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockSite);
  });

  it('should delete a site', () => {
    service.deleteSite(2).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/site/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
