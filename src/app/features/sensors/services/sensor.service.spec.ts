import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SensorService } from './sensor.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../../../shared/models/sensor.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('SensorService', () => {
  let service: SensorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SensorService]
    });
    service = TestBed.inject(SensorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch sensors with filters', () => {
    const mockSensors: PagedResult<Sensor> = {
      items: [
        {
          id: 1,
          name: 'Sensor',
          deviceId: 2,
          deviceName: 'Device',
          siteId: 3,
          siteName: 'Site',
          zoneName: 'Zone',
          regTypeId: 4,
          regTypeName: 'Level',
          regTypeCount: 1,
          regTypeDataType: 'float',
          createdDate: '2024-01-01'
        }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getSensors({ deviceId: 2, pageNumber: 1, pageSize: 10 }).subscribe(result => {
      expect(result).toEqual(mockSensors);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/sensor`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('deviceId')).toBe('2');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockSensors);
  });

  it('should fetch sensor by id', () => {
    const mockSensor: Sensor = {
      id: 2,
      name: 'Sensor',
      deviceId: 3,
      deviceName: 'Device',
      siteId: 4,
      siteName: 'Site',
      zoneName: 'Zone',
      regTypeId: 5,
      regTypeName: 'Level',
      regTypeCount: 1,
      regTypeDataType: 'float',
      createdDate: '2024-01-01'
    };

    service.getSensorById(2).subscribe(result => {
      expect(result).toEqual(mockSensor);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sensor/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSensor);
  });

  it('should create a sensor', () => {
    const request: CreateSensorRequest = { name: 'New', deviceId: 3, regTypeId: 5, threshold: 10 };
    const mockSensor: Sensor = {
      id: 5,
      name: 'New',
      deviceId: 3,
      deviceName: 'Device',
      siteId: 4,
      siteName: 'Site',
      zoneName: 'Zone',
      regTypeId: 5,
      regTypeName: 'Level',
      regTypeCount: 1,
      regTypeDataType: 'float',
      threshold: 10,
      createdDate: '2024-01-01'
    };

    service.createSensor(request).subscribe(result => {
      expect(result).toEqual(mockSensor);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sensor`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockSensor);
  });

  it('should update a sensor', () => {
    const request: UpdateSensorRequest = { id: 4, name: 'Updated', deviceId: 2, regTypeId: 5, threshold: 11 };
    const mockSensor: Sensor = {
      id: 4,
      name: 'Updated',
      deviceId: 2,
      deviceName: 'Device',
      siteId: 3,
      siteName: 'Site',
      zoneName: 'Zone',
      regTypeId: 5,
      regTypeName: 'Level',
      regTypeCount: 1,
      regTypeDataType: 'float',
      threshold: 11,
      createdDate: '2024-01-01',
      lastModifiedDate: '2024-01-02'
    };

    service.updateSensor(request).subscribe(result => {
      expect(result).toEqual(mockSensor);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sensor/${request.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mockSensor);
  });

  it('should delete a sensor', () => {
    service.deleteSensor(3).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/sensor/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
