import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../services/notification.service';
import {
  NotificationRule,
  CreateNotificationRuleRequest,
  UpdateNotificationRuleRequest
} from '../../../../shared/models/notification.model';
import { EventTypeService } from '../../../eventtypes/services/eventtype.service';
import { EventType } from '../../../../shared/models/eventtype.model';
import { UsersService } from '../../../users/services/users.service';
import { UserListItem } from '../../../users/models/user-list-item.model';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
    ModalComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  rules = signal<NotificationRule[]>([]);
  totalRecords = signal(0);
  pageSize = signal(10);
  showModal = signal(false);
  editingRule = signal<NotificationRule | null>(null);
  formData: {
    name: string;
    triggerType: string;
    eventTypeId: number | undefined;
    channel: string;
    recipientUserId: number | undefined;
    isActive: boolean;
  } = {
    name: '',
    triggerType: 'EventCreated',
    eventTypeId: undefined,
    channel: 'Email',
    recipientUserId: undefined,
    isActive: true
  };

  nameSearch = signal('');
  triggerTypeFilter = signal<string | undefined>(undefined);
  isActiveFilter = signal<boolean | undefined>(undefined);
  private isLoading = false;
  private lastLoadParams: {
    pageNumber: number;
    pageSize: number;
    nameSearch?: string;
    triggerType?: string;
    isActive?: boolean;
  } | null = null;

  eventTypes = signal<EventType[]>([]);
  users = signal<UserListItem[]>([]);

  triggerTypeOptions = [
    { label: 'Event Created', value: 'EventCreated' },
    { label: 'Event Unresolved', value: 'EventUnresolved' }
  ];
  channelOptions = [
    { label: 'Email', value: 'Email' },
    { label: 'In-App', value: 'InApp' }
  ];
  filterTriggerOptions = [
    { label: 'All', value: undefined },
    { label: 'Event Created', value: 'EventCreated' },
    { label: 'Event Unresolved', value: 'EventUnresolved' }
  ];
  filterActiveOptions = [
    { label: 'All', value: undefined },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  eventTypeOptions = computed(() =>
    this.eventTypes().map(et => ({ label: et.name, value: et.id }))
  );
  userOptions = computed(() =>
    this.users().map(u => ({
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      value: u.userId
    }))
  );

  private notificationService = inject(NotificationService);
  private eventTypeService = inject(EventTypeService);
  private usersService = inject(UsersService);
  private permissionService = inject(PermissionService);
  private confirmationService = inject(ConfirmationService);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);

  canViewNotifications = computed(() => this.permissionService.hasPermission('View Notifications'));
  canManageNotifications = computed(() => this.permissionService.hasPermission('Manage Notifications'));

  ngOnInit(): void {
    this.loadEventTypes();
    this.loadUsers();
  }

  loadEventTypes(): void {
    this.eventTypeService.getEventTypes(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => this.eventTypes.set(r.items),
      error: () => this.eventTypes.set([])
    });
  }

  loadUsers(): void {
    this.usersService.getUsers(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => this.users.set(r.items),
      error: () => this.users.set([])
    });
  }

  loadRules(pageNumber: number, pageSize: number): void {
    if (this.isLoading) return;
    const nameSearch = this.nameSearch().trim() || undefined;
    const triggerType = this.triggerTypeFilter();
    const isActive = this.isActiveFilter();
    if (
      this.lastLoadParams &&
      this.lastLoadParams.pageNumber === pageNumber &&
      this.lastLoadParams.pageSize === pageSize &&
      this.lastLoadParams.nameSearch === nameSearch &&
      this.lastLoadParams.triggerType === triggerType &&
      this.lastLoadParams.isActive === isActive
    ) {
      return;
    }
    this.lastLoadParams = { pageNumber, pageSize, nameSearch, triggerType, isActive };
    this.isLoading = true;
    this.loadingService.startLoading();
    this.errorService.clearError();

    this.notificationService
      .getNotificationRules({ nameSearch, triggerType, isActive, pageNumber, pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.rules.set(result.items);
          this.totalRecords.set(result.totalCount);
          this.loadingService.stopLoading();
          this.isLoading = false;
        },
        error: err => {
          this.errorService.setErrorFromHttp(err);
          this.loadingService.stopLoading();
          this.isLoading = false;
          this.lastLoadParams = null;
        }
      });
  }

  applyFilters(): void {
    this.lastLoadParams = null;
    this.loadRules(1, this.pageSize());
  }

  clearFilters(): void {
    this.nameSearch.set('');
    this.triggerTypeFilter.set(undefined);
    this.isActiveFilter.set(undefined);
    this.lastLoadParams = null;
    this.loadRules(1, this.pageSize());
  }

  showCreateForm(): void {
    this.editingRule.set(null);
    this.formData = {
      name: '',
      triggerType: 'EventCreated',
      eventTypeId: undefined,
      channel: 'Email',
      recipientUserId: undefined,
      isActive: true
    };
    this.showModal.set(true);
  }

  editRule(rule: NotificationRule): void {
    this.editingRule.set(rule);
    this.formData = {
      name: rule.name,
      triggerType: rule.triggerType,
      eventTypeId: rule.eventTypeId ?? undefined,
      channel: rule.channel,
      recipientUserId: rule.recipientUserId,
      isActive: rule.isActive
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingRule.set(null);
  }

  saveRule(): void {
    if (!this.formData.name.trim()) {
      this.errorService.setError('Name is required');
      return;
    }
    if (this.formData.recipientUserId == null || this.formData.recipientUserId <= 0) {
      this.errorService.setError('Recipient is required');
      return;
    }

    this.loadingService.startLoading();
    this.errorService.clearError();

    const editing = this.editingRule();
    if (editing) {
      const request: UpdateNotificationRuleRequest = {
        id: editing.id,
        name: this.formData.name.trim(),
        triggerType: this.formData.triggerType,
        eventTypeId: this.formData.eventTypeId,
        channel: this.formData.channel,
        recipientUserId: this.formData.recipientUserId,
        isActive: this.formData.isActive
      };
      this.notificationService
        .updateNotificationRule(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.lastLoadParams = null;
            this.loadRules(1, this.pageSize());
            this.closeModal();
          },
          error: err => {
            this.errorService.setErrorFromHttp(err);
            this.loadingService.stopLoading();
          }
        });
    } else {
      const request: CreateNotificationRuleRequest = {
        name: this.formData.name.trim(),
        triggerType: this.formData.triggerType,
        eventTypeId: this.formData.eventTypeId,
        channel: this.formData.channel,
        recipientUserId: this.formData.recipientUserId,
        isActive: this.formData.isActive
      };
      this.notificationService
        .createNotificationRule(request)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.lastLoadParams = null;
            this.loadRules(1, this.pageSize());
            this.closeModal();
          },
          error: err => {
            this.errorService.setErrorFromHttp(err);
            this.loadingService.stopLoading();
          }
        });
    }
  }

  deleteRule(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this notification rule?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingService.startLoading();
        this.errorService.clearError();
        this.notificationService
          .deleteNotificationRule(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.lastLoadParams = null;
              this.loadRules(1, this.pageSize());
            },
            error: err => {
              this.errorService.setErrorFromHttp(err);
              this.loadingService.stopLoading();
            }
          });
      }
    });
  }

  clearError = (): void => this.errorService.clearError();

  onLazyLoad(event: TableLazyLoadEvent): void {
    const pageSize = event.rows ?? 10;
    const first = event.first ?? 0;
    const pageNumber = Math.floor(first / pageSize) + 1;
    if (this.pageSize() !== pageSize) this.pageSize.set(pageSize);
    this.loadRules(pageNumber, pageSize);
  }

  trackById(index: number, rule: NotificationRule): number {
    return rule.id;
  }
}
