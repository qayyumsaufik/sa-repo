import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../../shared/models/tenant.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Reduced from 52 lines to 30 lines.
 */
export class TenantService extends BaseCachedService<Tenant> {
  getTenants(pageNumber?: number, pageSize?: number): Observable<PagedResult<Tenant>> {
    return this.getCached('tenant', undefined, pageNumber, pageSize);
  }

  getTenantById(id: number): Observable<Tenant> {
    return this.getById('tenant', id);
  }

  createTenant(request: CreateTenantRequest): Observable<Tenant> {
    return this.create('tenant', request);
  }

  updateTenant(request: UpdateTenantRequest): Observable<Tenant> {
    return this.update('tenant', request.id, request);
  }

  deleteTenant(id: number): Observable<void> {
    return this.delete('tenant', id);
  }
}
