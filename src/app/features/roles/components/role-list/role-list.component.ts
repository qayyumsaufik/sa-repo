import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../../../shared/models/role.model';
import { PermissionService } from '../../../../core/services/permission.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles = signal<Role[]>([]);
  totalRecords = signal(0);
  tableFirst = signal(0);
  pageSize = signal(50);

  private rolesService = inject(RolesService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);

  /** Prevents duplicate requests when table re-fires onLazyLoad after we update first/totalRecords */
  private loadingRoles = false;
  private lastLoadFirst: number | null = null;
  private lastLoadRows: number | null = null;

  clearError = (): void => this.errorService.clearError();

  canManageRoles = computed(() => this.permissionService.hasPermission('Manage Roles'));
  canManagePermissions = computed(() => this.permissionService.hasPermission('View Roles'));

  ngOnInit(): void {
    this.authService.isAuthenticated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Initial load via onLazyLoad
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? 50;
    if (this.loadingRoles) return;
    if (this.lastLoadFirst === first && this.lastLoadRows === rows && this.roles().length > 0) return;

    this.loadingRoles = true;
    this.lastLoadFirst = first;
    this.lastLoadRows = rows;
    const pageNumber = rows > 0 ? Math.floor(first / rows) + 1 : 1;
    this.loadingService.startLoading();
    this.errorService.clearError();

    this.rolesService
      .getRoles({ pageNumber, pageSize: rows })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.roles.set(res.items);
          this.totalRecords.set(res.totalCount);
          this.tableFirst.set(first);
          this.pageSize.set(rows);
          this.loadingService.stopLoading();
          this.loadingRoles = false;
        },
        error: e => {
          this.loadingService.stopLoading();
          this.loadingRoles = false;
          this.errorService.setErrorFromHttp(e);
        }
      });
  }

  trackByRoleId(_: number, role: Role): number {
    return role.id;
  }
}
