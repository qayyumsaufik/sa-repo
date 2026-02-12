import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Event, ResolveEventRequest, GetEventsQueryParams } from '../../../shared/models/event.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private api = inject(ApiService);

  getEvents(params?: GetEventsQueryParams): Observable<PagedResult<Event>> {
    return this.api.get<PagedResult<Event>>('event', params);
  }

  getEventById(id: number): Observable<Event> {
    return this.api.get<Event>(`event/${id}`);
  }

  getUnresolvedEventsCount(): Observable<number> {
    return this.api.get<number>('event/unresolved/count');
  }

  resolveEvent(id: number, request: ResolveEventRequest): Observable<Event> {
    return this.api.post<Event>(`event/${id}/resolve`, request);
  }

  deleteEvent(id: number): Observable<void> {
    return this.api.delete<void>(`event/${id}`);
  }

  // Query params are passed directly to ApiService
}
