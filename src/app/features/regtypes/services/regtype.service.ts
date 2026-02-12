import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCachedService } from '../../../core/services/base-cached.service';
import { RegType, CreateRegTypeRequest, UpdateRegTypeRequest } from '../../../shared/models/regtype.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
/**
 * REFACTORING: Now extends BaseCachedService to reduce code duplication.
 * Reduced from 52 lines to 30 lines.
 */
export class RegTypeService extends BaseCachedService<RegType> {
  getRegTypes(pageNumber?: number, pageSize?: number): Observable<PagedResult<RegType>> {
    return this.getCached('regtype', undefined, pageNumber, pageSize);
  }

  getRegTypeById(id: number): Observable<RegType> {
    return this.getById('regtype', id);
  }

  createRegType(request: CreateRegTypeRequest): Observable<RegType> {
    return this.create('regtype', request);
  }

  updateRegType(request: UpdateRegTypeRequest): Observable<RegType> {
    return this.update('regtype', request.id, request);
  }

  deleteRegType(id: number): Observable<void> {
    return this.delete('regtype', id);
  }
}
