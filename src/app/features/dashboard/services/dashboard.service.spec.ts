import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardData, DashboardSummary, GetDashboardDataParams } from '../../../shared/models/dashboard.model';
import { environment } from '../../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build query params for dashboard data', () => {
    const params: GetDashboardDataParams = {
      siteId: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    };
    const mockData = {} as DashboardData;

    service.getDashboardData(params).subscribe(result => {
      expect(result).toEqual(mockData);
    });

    const expectedUrl = `${environment.apiUrl}/dashboard?siteId=1&startDate=2024-01-01&endDate=2024-01-31`;
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch dashboard summary without siteId', () => {
    const mockSummary = {} as DashboardSummary;

    service.getDashboardSummary().subscribe(result => {
      expect(result).toEqual(mockSummary);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });

  it('should fetch dashboard summary with siteId', () => {
    const mockSummary = {} as DashboardSummary;

    service.getDashboardSummary(2).subscribe(result => {
      expect(result).toEqual(mockSummary);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/summary?siteId=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });
});
