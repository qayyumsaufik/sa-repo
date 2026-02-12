import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { Sensor, CreateSensorRequest, UpdateSensorRequest } from '../../../shared/models/sensor.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Uses keyed caching for device-filtered queries.
 * Reduced from 59 lines to 35 lines.
 */
export class SensorService extends BaseCachedService<Sensor> {
  getSensors(params: { deviceId?: number; sortField?: string; sortOrder?: number; nameSearch?: string; pageNumber?: number; pageSize?: number } = {}): Observable<PagedResult<Sensor>> {
    const { deviceId, sortField, sortOrder, nameSearch, pageNumber, pageSize } = params;
    const cacheKey = deviceId ? `device-${deviceId}` : 'all';
    const queryParams: Record<string, string | number | undefined> = {};
    if (deviceId != null) queryParams['deviceId'] = deviceId;
    if (sortField != null && sortField !== '') queryParams['sortField'] = sortField;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (nameSearch != null && nameSearch !== '') queryParams['nameSearch'] = nameSearch;
    return this.getCachedWithKey('sensor', cacheKey, queryParams, pageNumber, pageSize);
  }

  getSensorById(id: number): Observable<Sensor> {
    return this.getById('sensor', id);
  }

  createSensor(request: CreateSensorRequest): Observable<Sensor> {
    return this.create('sensor', request);
  }

  updateSensor(request: UpdateSensorRequest): Observable<Sensor> {
    return this.update('sensor', request.id, request);
  }

  deleteSensor(id: number): Observable<void> {
    return this.delete('sensor', id);
  }
}
