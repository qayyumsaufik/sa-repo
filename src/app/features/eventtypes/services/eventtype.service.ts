import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '../../../shared/models/eventtype.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Reduced from 58 lines to 30 lines.
 */
export class EventTypeService extends BaseCachedService<EventType> {
  getEventTypes(pageNumber?: number, pageSize?: number): Observable<PagedResult<EventType>> {
    return this.getCached('eventtype', undefined, pageNumber, pageSize);
  }

  getEventTypeById(id: number): Observable<EventType> {
    return this.getById('eventtype', id);
  }

  createEventType(request: CreateEventTypeRequest): Observable<EventType> {
    return this.create('eventtype', request);
  }

  updateEventType(request: UpdateEventTypeRequest): Observable<EventType> {
    return this.update('eventtype', request.id, request);
  }

  deleteEventType(id: number): Observable<void> {
    return this.delete('eventtype', id);
  }
}
