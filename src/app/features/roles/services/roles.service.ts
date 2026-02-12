import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Role, ScreenDto, ScreenPermissionDto } from '../../../shared/models/role.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private api = inject(ApiService);

  getRoles(params: {
    tenantId?: number;
    pageNumber?: number;
    pageSize?: number;
    nameSearch?: string;
  } = {}): Observable<PagedResult<Role>> {
    return this.api.get<PagedResult<Role>>('role', params as Record<string, number | string | undefined>);
  }

  getRoleById(id: number): Observable<Role> {
    return this.api.get<Role>(`role/${id}`);
  }

  getScreens(): Observable<ScreenDto[]> {
    return this.api.get<ScreenDto[]>('permission/screens');
  }

  getRoleScreenPermissions(roleId: number): Observable<ScreenPermissionDto[]> {
    return this.api.get<ScreenPermissionDto[]>(`role/${roleId}/screen-permissions`);
  }

  setRoleScreenPermissions(roleId: number, screens: ScreenPermissionDto[]): Observable<void> {
    return this.api.put<void>(`role/${roleId}/screen-permissions`, { roleId, screens });
  }
}
