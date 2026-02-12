import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { filter, take, switchMap } from 'rxjs/operators';
import { UsersService } from '../../services/users.service';
import { UserListItem } from '../../models/user-list-item.model';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    TooltipModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users = signal<UserListItem[]>([]);
  totalRecords = signal(0);
  pageSize = signal(10);
  tenantIdFromRoute = signal<number | null>(null);
  pageTitle = computed(() => {
    const tid = this.tenantIdFromRoute();
    if (tid != null) {
      return 'Users by tenant';
    }
    return this.permissionService.hasRole('SuperAdministrator') ? 'All users' : 'Users';
  });
  pageSubtitle = computed(() => {
    const tid = this.tenantIdFromRoute();
    if (tid != null) return `Tenant ID: ${tid}`;
    return this.permissionService.hasRole('SuperAdministrator')
      ? 'Users across all tenants'
      : 'Users in your tenant';
  });

  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);

  private isLoading = false;
  private lastLoadParams: { pageNumber: number; pageSize: number; tenantId: number | undefined } | null = null;

  canViewUsers = computed(() => this.permissionService.hasPermission('View Users') || this.permissionService.hasRole('SuperAdministrator'));

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(
        filter(Boolean),
        take(1),
        switchMap(() => this.route.queryParams),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => {
        const tid = params['tenantId'];
        this.tenantIdFromRoute.set(tid != null && tid !== '' ? +tid : null);
        this.lastLoadParams = null;
        this.loadUsers(1, this.pageSize());
      });
  }

  loadUsers(pageNumber: number, size: number): void {
    if (!this.canViewUsers()) {
      this.errorService.setError('You do not have permission to view users.');
      return;
    }
    if (this.isLoading) return;
    const tid = this.tenantIdFromRoute();
    const tenantId = tid != null ? tid : undefined;
    if (
      this.lastLoadParams &&
      this.lastLoadParams.pageNumber === pageNumber &&
      this.lastLoadParams.pageSize === size &&
      this.lastLoadParams.tenantId === tenantId
    ) {
      return;
    }

    this.lastLoadParams = { pageNumber, pageSize: size, tenantId };
    this.isLoading = true;
    this.loadingService.startLoading();
    this.errorService.clearError();

    this.usersService.getUsers(pageNumber, size, tenantId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.users.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loadingService.stopLoading();
        this.isLoading = false;
      },
      error: err => {
        this.logger.errorWithPrefix('UserListComponent', 'Error loading users', err);
        this.errorService.setErrorFromHttp(err);
        this.loadingService.stopLoading();
        this.isLoading = false;
        this.lastLoadParams = null;
      }
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const pageNumber = event.first != null && event.rows != null ? Math.floor(event.first / event.rows) + 1 : 1;
    const size = event.rows ?? this.pageSize();
    this.pageSize.set(size);
    this.loadUsers(pageNumber, size);
  }

  trackByUserId(_index: number, user: UserListItem): number {
    return user.userId;
  }

  displayName(user: UserListItem): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return name || user.email;
  }

  clearError = (): void => {
    this.errorService.clearError();
  };
}
