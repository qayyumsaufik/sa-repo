import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ZoneService } from './zone.service';
import { Zone, CreateZoneRequest, UpdateZoneRequest } from '../../../shared/models/zone.model';
import { environment } from '../../../../environments/environment';

describe('ZoneService', () => {
  let service: ZoneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ZoneService]
    });
    service = TestBed.inject(ZoneService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getZones', () => {
    it('should return zones', () => {
      const mockZones = {
        items: [
          { id: 1, name: 'Zone 1', description: 'Description 1', createdDate: '2024-01-01' },
          { id: 2, name: 'Zone 2', description: 'Description 2', createdDate: '2024-01-02' }
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 10
      };

      service.getZones().subscribe(zones => {
        expect(zones).toEqual(mockZones);
        expect(zones.items.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/zone`);
      expect(req.request.method).toBe('GET');
      req.flush(mockZones);
    });
  });

  describe('getZoneById', () => {
    it('should return a zone by id', () => {
      const mockZone: Zone = {
        id: 1,
        name: 'Zone 1',
        description: 'Description 1',
        createdDate: '2024-01-01'
      };

      service.getZoneById(1).subscribe(zone => {
        expect(zone).toEqual(mockZone);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/zone/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockZone);
    });
  });

  describe('createZone', () => {
    it('should create a zone', () => {
      const createRequest: CreateZoneRequest = {
        name: 'New Zone',
        description: 'New Description'
      };

      const mockZone: Zone = {
        id: 1,
        name: 'New Zone',
        description: 'New Description',
        createdDate: '2024-01-01'
      };

      service.createZone(createRequest).subscribe(zone => {
        expect(zone).toEqual(mockZone);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/zone`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockZone);
    });
  });

  describe('updateZone', () => {
    it('should update a zone', () => {
      const updateRequest: UpdateZoneRequest = {
        id: 1,
        name: 'Updated Zone',
        description: 'Updated Description'
      };

      const mockZone: Zone = {
        id: 1,
        name: 'Updated Zone',
        description: 'Updated Description',
        createdDate: '2024-01-01',
        lastModifiedDate: '2024-01-02'
      };

      service.updateZone(updateRequest).subscribe(zone => {
        expect(zone).toEqual(mockZone);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/zone/${updateRequest.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockZone);
    });
  });

  describe('deleteZone', () => {
    it('should delete a zone', () => {
      service.deleteZone(1).subscribe(() => {
        // Success
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/zone/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
