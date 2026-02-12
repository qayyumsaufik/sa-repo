import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { Event, ResolveEventRequest, GetEventsQueryParams } from '../../../shared/models/event.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch events with params', () => {
    const params: GetEventsQueryParams = {
      pageNumber: 1,
      pageSize: 10,
      resolved: false
    };
    const mockEvents: PagedResult<Event> = {
      items: [
        {
          id: 1,
          sensorId: 2,
          sensorName: 'Sensor',
          deviceId: 10,
          deviceName: 'Device',
          siteId: 20,
          siteName: 'Site',
          zoneName: 'Zone',
          timeRaised: '2024-01-01',
          message: 'Msg',
          eventTypeId: 3,
          eventTypeName: 'Type',
          eventTypeSeverity: 'Low',
          resolved: false,
          createdDate: '2024-01-01'
        }
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    service.getEvents(params).subscribe(result => {
      expect(result).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/event`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('resolved')).toBe('false');
    req.flush(mockEvents);
  });

  it('should fetch event by id', () => {
    const mockEvent: Event = {
      id: 5,
      sensorId: 2,
      sensorName: 'Sensor',
      deviceId: 10,
      deviceName: 'Device',
      siteId: 20,
      siteName: 'Site',
      zoneName: 'Zone',
      timeRaised: '2024-01-01',
      message: 'Msg',
      eventTypeId: 3,
      eventTypeName: 'Type',
      eventTypeSeverity: 'Low',
      resolved: false,
      createdDate: '2024-01-01'
    };

    service.getEventById(5).subscribe(result => {
      expect(result).toEqual(mockEvent);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/event/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });

  it('should fetch unresolved event count', () => {
    service.getUnresolvedEventsCount().subscribe(result => {
      expect(result).toBe(3);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/event/unresolved/count`);
    expect(req.request.method).toBe('GET');
    req.flush(3);
  });

  it('should resolve an event', () => {
    const request: ResolveEventRequest = { resolutionNotes: 'Fixed' };
    const mockEvent: Event = {
      id: 7,
      sensorId: 2,
      sensorName: 'Sensor',
      deviceId: 10,
      deviceName: 'Device',
      siteId: 20,
      siteName: 'Site',
      zoneName: 'Zone',
      timeRaised: '2024-01-01',
      message: 'Msg',
      eventTypeId: 3,
      eventTypeName: 'Type',
      eventTypeSeverity: 'High',
      resolved: true,
      createdDate: '2024-01-01'
    };

    service.resolveEvent(7, request).subscribe(result => {
      expect(result).toEqual(mockEvent);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/event/7/resolve`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockEvent);
  });

  it('should delete an event', () => {
    service.deleteEvent(8).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/event/8`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
