import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventTypeService } from './eventtype.service';
import { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '../../../shared/models/eventtype.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

describe('EventTypeService', () => {
  let service: EventTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventTypeService]
    });
    service = TestBed.inject(EventTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEventTypes', () => {
    it('should return paged event types', () => {
      const mockEventTypes: PagedResult<EventType> = {
        items: [
          { id: 1, name: 'Event 1', description: 'Description 1', category: 'Category 1', severity: 'Low', createdDate: '2024-01-01' },
          { id: 2, name: 'Event 2', description: 'Description 2', category: 'Category 2', severity: 'High', createdDate: '2024-01-02' }
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 10
      };

      service.getEventTypes(1, 10).subscribe(result => {
        expect(result).toEqual(mockEventTypes);
        expect(result.items.length).toBe(2);
      });

      const req = httpMock.expectOne(request => request.url === `${environment.apiUrl}/eventtype`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockEventTypes);
    });
  });

  describe('getEventTypeById', () => {
    it('should return an event type by id', () => {
      const mockEventType: EventType = {
        id: 1,
        name: 'Event 1',
        description: 'Description 1',
        category: 'Category 1',
        severity: 'Low',
        createdDate: '2024-01-01'
      };

      service.getEventTypeById(1).subscribe(eventType => {
        expect(eventType).toEqual(mockEventType);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/eventtype/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEventType);
    });
  });

  describe('createEventType', () => {
    it('should create an event type', () => {
      const createRequest: CreateEventTypeRequest = {
        name: 'New Event',
        description: 'New Description',
        category: 'New Category',
        severity: 'Medium'
      };

      const mockEventType: EventType = {
        id: 1,
        name: 'New Event',
        description: 'New Description',
        category: 'New Category',
        severity: 'Medium',
        createdDate: '2024-01-01'
      };

      service.createEventType(createRequest).subscribe(eventType => {
        expect(eventType).toEqual(mockEventType);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/eventtype`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockEventType);
    });
  });

  describe('updateEventType', () => {
    it('should update an event type', () => {
      const updateRequest: UpdateEventTypeRequest = {
        id: 1,
        name: 'Updated Event',
        description: 'Updated Description',
        category: 'Updated Category',
        severity: 'High'
      };

      const mockEventType: EventType = {
        id: 1,
        name: 'Updated Event',
        description: 'Updated Description',
        category: 'Updated Category',
        severity: 'High',
        createdDate: '2024-01-01',
        lastModifiedDate: '2024-01-02'
      };

      service.updateEventType(updateRequest).subscribe(eventType => {
        expect(eventType).toEqual(mockEventType);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/eventtype/${updateRequest.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockEventType);
    });
  });

  describe('deleteEventType', () => {
    it('should delete an event type', () => {
      service.deleteEventType(1).subscribe(() => {
        // Success
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/eventtype/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
