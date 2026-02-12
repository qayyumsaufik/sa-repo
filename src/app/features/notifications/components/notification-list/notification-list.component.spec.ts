import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationListComponent } from './notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { EventTypeService } from '../../../eventtypes/services/eventtype.service';
import { UsersService } from '../../../users/services/users.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ConfirmationService } from 'primeng/api';

describe('NotificationListComponent', () => {
  beforeEach(async () => {
    const notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'getNotificationRules',
      'createNotificationRule',
      'updateNotificationRule',
      'deleteNotificationRule'
    ]);
    notificationService.getNotificationRules.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const eventTypeService = jasmine.createSpyObj<EventTypeService>('EventTypeService', ['getEventTypes']);
    eventTypeService.getEventTypes.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const usersService = jasmine.createSpyObj<UsersService>('UsersService', ['getUsers']);
    usersService.getUsers.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const errorService = jasmine.createSpyObj<ErrorService>('ErrorService', ['clearError', 'setError', 'setErrorFromHttp']);
    const loadingService = jasmine.createSpyObj<LoadingService>('LoadingService', ['startLoading', 'stopLoading']);
    loadingService.loading = jasmine.createSpy().and.returnValue(false);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [NotificationListComponent],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: EventTypeService, useValue: eventTypeService },
        { provide: UsersService, useValue: usersService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ErrorService, useValue: errorService },
        { provide: LoadingService, useValue: loadingService },
        { provide: ConfirmationService, useValue: confirmationService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NotificationListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
