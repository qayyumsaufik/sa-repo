import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MaintenanceService } from './maintenance.service';
import { Maintenance, GetMaintenancesQueryParams } from '../../../shared/models/maintenance.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MaintenanceService]
    });
    service = TestBed.inject(MaintenanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch maintenances with params', () => {
    const params: GetMaintenancesQueryParams = { pageNumber: 1, pageSize: 10, sensorId: 5 };
    const mockMaintenances: PagedResult<Maintenance> = {
      items: [
        {
          id: 1,
          sensorId: 5,
          sensorName: 'Sensor',
          deviceId: 10,
          deviceName: 'Device',
          siteId: 20,
          siteName: 'Site',
          zoneName: 'Zone',
          userId: 2,
          userName: 'User',
          message: 'Msg',
          createdDate: '2024-01-01'
        }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getMaintenances(params).subscribe(result => {
      expect(result).toEqual(mockMaintenances);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/maintenance`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sensorId')).toBe('5');
    req.flush(mockMaintenances);
  });

  it('should fetch maintenance by id', () => {
    const mockMaintenance: Maintenance = {
      id: 2,
      sensorId: 5,
      sensorName: 'Sensor',
      deviceId: 10,
      deviceName: 'Device',
      siteId: 20,
      siteName: 'Site',
      zoneName: 'Zone',
      userId: 2,
      userName: 'User',
      message: 'Msg',
      createdDate: '2024-01-01'
    };

    service.getMaintenanceById(2).subscribe(result => {
      expect(result).toEqual(mockMaintenance);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/maintenance/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMaintenance);
  });

  it('should create a maintenance record', () => {
    const mockMaintenance: Maintenance = {
      id: 3,
      sensorId: 1,
      sensorName: 'Sensor',
      deviceId: 10,
      deviceName: 'Device',
      siteId: 20,
      siteName: 'Site',
      zoneName: 'Zone',
      userId: 2,
      userName: 'User',
      message: 'Work',
      createdDate: '2024-01-01'
    };

    service.createMaintenance(1, 2, 'Work').subscribe(result => {
      expect(result).toEqual(mockMaintenance);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/maintenance`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ sensorId: 1, userId: 2, message: 'Work' });
    req.flush(mockMaintenance);
  });

  it('should delete maintenance', () => {
    service.deleteMaintenance(4).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/maintenance/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
