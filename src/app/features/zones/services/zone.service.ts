import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { Zone, CreateZoneRequest, UpdateZoneRequest } from '../../../shared/models/zone.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Reduced from 52 lines to 30 lines.
 */
export class ZoneService extends BaseCachedService<Zone> {
  getZones(params: { sortField?: string; sortOrder?: number; nameSearch?: string; pageNumber?: number; pageSize?: number } = {}): Observable<PagedResult<Zone>> {
    const { sortField, sortOrder, nameSearch, pageNumber, pageSize } = params;
    const queryParams: Record<string, string | number | undefined> = {};
    if (sortField != null && sortField !== '') queryParams['sortField'] = sortField;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (nameSearch != null && nameSearch !== '') queryParams['nameSearch'] = nameSearch;
    return this.getCached('zone', queryParams, pageNumber, pageSize);
  }

  getZoneById(id: number): Observable<Zone> {
    return this.getById('zone', id);
  }

  createZone(request: CreateZoneRequest): Observable<Zone> {
    return this.create('zone', request);
  }

  updateZone(request: UpdateZoneRequest): Observable<Zone> {
    return this.update('zone', request.id, request);
  }

  deleteZone(id: number): Observable<void> {
    return this.delete('zone', id);
  }
}
