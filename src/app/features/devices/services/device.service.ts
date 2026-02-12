import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { Device, CreateDeviceRequest, UpdateDeviceRequest } from '../../../shared/models/device.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Uses keyed caching for site-filtered queries.
 * Reduced from 59 lines to 35 lines.
 */
export class DeviceService extends BaseCachedService<Device> {
  getDevices(params: {
    siteId?: number;
    zoneId?: number;
    sortField?: string;
    sortOrder?: number;
    nameSearch?: string;
    ipSearch?: string;
    pageNumber?: number;
    pageSize?: number;
  } = {}): Observable<PagedResult<Device>> {
    const { siteId, zoneId, sortField, sortOrder, nameSearch, ipSearch, pageNumber, pageSize } = params;
    const cacheKey = siteId ? `site-${siteId}` : zoneId ? `zone-${zoneId}` : 'all';
    const queryParams: Record<string, string | number | undefined> = {};
    if (siteId != null) queryParams['siteId'] = siteId;
    if (zoneId != null) queryParams['zoneId'] = zoneId;
    if (sortField != null && sortField !== '') queryParams['sortField'] = sortField;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (nameSearch != null && nameSearch !== '') queryParams['nameSearch'] = nameSearch;
    if (ipSearch != null && ipSearch !== '') queryParams['ipSearch'] = ipSearch;
    return this.getCachedWithKey('device', cacheKey, queryParams, pageNumber, pageSize);
  }

  getDeviceById(id: number): Observable<Device> {
    return this.getById('device', id);
  }

  createDevice(request: CreateDeviceRequest): Observable<Device> {
    return this.create('device', request);
  }

  updateDevice(request: UpdateDeviceRequest): Observable<Device> {
    return this.update('device', request.id, request);
  }

  deleteDevice(id: number): Observable<void> {
    return this.delete('device', id);
  }
}
