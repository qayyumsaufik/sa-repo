import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { UserListItem } from '../models/user-list-item.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiService = inject(ApiService);

  getUsers(pageNumber?: number, pageSize?: number, tenantId?: number): Observable<PagedResult<UserListItem>> {
    const params: Record<string, number> = {};
    if (pageNumber != null) params['pageNumber'] = pageNumber;
    if (pageSize != null) params['pageSize'] = pageSize;
    if (tenantId != null) params['tenantId'] = tenantId;
    return this.apiService.get<PagedResult<UserListItem>>('user/list', params);
  }
}
