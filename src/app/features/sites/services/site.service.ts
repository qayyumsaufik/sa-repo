import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { Site, CreateSiteRequest, UpdateSiteRequest } from '../../../shared/models/site.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Uses keyed caching for zone-filtered queries.
 * Reduced from 59 lines to 35 lines.
 */
export class SiteService extends BaseCachedService<Site> {
  getSites(params: { zoneId?: number; sortField?: string; sortOrder?: number; nameSearch?: string; statusFilter?: string; pageNumber?: number; pageSize?: number } = {}): Observable<PagedResult<Site>> {
    const { zoneId, sortField, sortOrder, nameSearch, statusFilter, pageNumber, pageSize } = params;
    const cacheKey = zoneId ? `zone-${zoneId}` : 'all';
    const queryParams: Record<string, string | number | undefined> = {};
    if (zoneId != null) queryParams['zoneId'] = zoneId;
    if (sortField != null && sortField !== '') queryParams['sortField'] = sortField;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (nameSearch != null && nameSearch !== '') queryParams['nameSearch'] = nameSearch;
    if (statusFilter != null && statusFilter !== '') queryParams['statusFilter'] = statusFilter;
    return this.getCachedWithKey('site', cacheKey, queryParams, pageNumber, pageSize);
  }

  getSiteById(id: number): Observable<Site> {
    return this.getById('site', id);
  }

  createSite(request: CreateSiteRequest): Observable<Site> {
    return this.create('site', request);
  }

  updateSite(request: UpdateSiteRequest): Observable<Site> {
    return this.update('site', request.id, request);
  }

  deleteSite(id: number): Observable<void> {
    return this.delete('site', id);
  }
}
