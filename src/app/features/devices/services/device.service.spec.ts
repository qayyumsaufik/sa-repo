import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeviceService } from './device.service';
import { Device, CreateDeviceRequest, UpdateDeviceRequest } from '../../../shared/models/device.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeviceService]
    });
    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch devices with filters', () => {
    const mockDevices: PagedResult<Device> = {
      items: [
        { id: 1, name: 'Device 1', siteId: 10, siteName: 'Site', zoneName: 'Zone', createdDate: '2024-01-01' }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getDevices({ siteId: 10, pageNumber: 1, pageSize: 10 }).subscribe(result => {
      expect(result).toEqual(mockDevices);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/device`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('siteId')).toBe('10');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockDevices);
  });

  it('should fetch device by id', () => {
    const mockDevice: Device = {
      id: 2,
      name: 'Device 2',
      siteId: 12,
      siteName: 'Site',
      zoneName: 'Zone',
      createdDate: '2024-01-01'
    };

    service.getDeviceById(2).subscribe(result => {
      expect(result).toEqual(mockDevice);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/device/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDevice);
  });

  it('should create a device', () => {
    const request: CreateDeviceRequest = {
      name: 'New Device',
      ip: '10.0.0.1',
      siteId: 5
    };
    const mockDevice: Device = {
      id: 3,
      name: 'New Device',
      ip: '10.0.0.1',
      siteId: 5,
      siteName: 'Site',
      zoneName: 'Zone',
      createdDate: '2024-01-01'
    };

    service.createDevice(request).subscribe(result => {
      expect(result).toEqual(mockDevice);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/device`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockDevice);
  });

  it('should update a device', () => {
    const request: UpdateDeviceRequest = {
      id: 9,
      name: 'Updated Device',
      ip: '10.0.0.9',
      siteId: 4
    };
    const mockDevice: Device = {
      id: 9,
      name: 'Updated Device',
      ip: '10.0.0.9',
      siteId: 4,
      siteName: 'Site',
      zoneName: 'Zone',
      createdDate: '2024-01-01',
      lastModifiedDate: '2024-01-02'
    };

    service.updateDevice(request).subscribe(result => {
      expect(result).toEqual(mockDevice);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/device/${request.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockDevice);
  });

  it('should delete a device', () => {
    service.deleteDevice(6).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/device/6`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
