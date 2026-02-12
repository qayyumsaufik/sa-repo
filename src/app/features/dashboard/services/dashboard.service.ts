import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardData, DashboardSummary, GetDashboardDataParams } from '../../../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  getDashboardData(params?: GetDashboardDataParams): Observable<DashboardData> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<DashboardData>(`dashboard${queryParams}`);
  }

  getDashboardSummary(siteId?: number): Observable<DashboardSummary> {
    const queryParams = siteId ? `?siteId=${siteId}` : '';
    return this.api.get<DashboardSummary>(`dashboard/summary${queryParams}`);
  }

  private buildQueryParams(params?: GetDashboardDataParams): string {
    if (!params) return '';
    
    const queryParts: string[] = [];
    
    if (params.siteId !== undefined) {
      queryParts.push(`siteId=${params.siteId}`);
    }
    if (params.startDate) {
      queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    }
    if (params.endDate) {
      queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
    }

    return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  }
}
