import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Reading, GetReadingsQueryParams } from '../../../shared/models/reading.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class ReadingService {
  private api = inject(ApiService);

  getReadings(params: GetReadingsQueryParams): Observable<PagedResult<Reading>> {
    return this.api.get<PagedResult<Reading>>('reading', params);
  }

  getReadingById(id: number): Observable<Reading> {
    return this.api.get<Reading>(`reading/${id}`);
  }

  getLatestReading(sensorId: number): Observable<Reading> {
    return this.api.get<Reading>(`reading/latest/${sensorId}`);
  }

  // Query params are passed directly to ApiService
}
