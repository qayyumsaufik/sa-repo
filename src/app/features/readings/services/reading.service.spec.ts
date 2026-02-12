import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReadingService } from './reading.service';
import { Reading, GetReadingsQueryParams } from '../../../shared/models/reading.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('ReadingService', () => {
  let service: ReadingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReadingService]
    });
    service = TestBed.inject(ReadingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch readings with params', () => {
    const params: GetReadingsQueryParams = { sensorId: 2, pageNumber: 1, pageSize: 10 };
    const mockReadings: PagedResult<Reading> = {
      items: [
        {
          id: 1,
          sensorId: 2,
          sensorName: 'Sensor',
          timestamp: '2024-01-01',
          values: [{ id: 1, readingId: 1, valueIndex: 0, value: '12.3', valueType: 'amps' }],
          createdDate: '2024-01-01'
        }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getReadings(params).subscribe(result => {
      expect(result).toEqual(mockReadings);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/reading`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('sensorId')).toBe('2');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockReadings);
  });

  it('should fetch reading by id', () => {
    const mockReading: Reading = {
      id: 9,
      sensorId: 2,
      sensorName: 'Sensor',
      timestamp: '2024-01-01',
      values: [{ id: 1, readingId: 9, valueIndex: 0, value: '12.3', valueType: 'amps' }],
      createdDate: '2024-01-01'
    };

    service.getReadingById(9).subscribe(result => {
      expect(result).toEqual(mockReading);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reading/9`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReading);
  });

  it('should fetch latest reading for sensor', () => {
    const mockReading: Reading = {
      id: 12,
      sensorId: 2,
      sensorName: 'Sensor',
      timestamp: '2024-01-02',
      values: [{ id: 1, readingId: 12, valueIndex: 0, value: '12.3', valueType: 'amps' }],
      createdDate: '2024-01-02'
    };

    service.getLatestReading(2).subscribe(result => {
      expect(result).toEqual(mockReading);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reading/latest/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReading);
  });
});
