import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TenantListComponent } from './client-list.component';
import { TenantService } from '../../services/tenant.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('TenantListComponent', () => {
  beforeEach(async () => {
    const tenantService = jasmine.createSpyObj<TenantService>('TenantService', ['getTenants', 'createTenant', 'updateTenant', 'deleteTenant']);
    tenantService.getTenants.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const authService = jasmine.createSpyObj<AuthService>('AuthService', [], { isAuthenticated$: of(true) });
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const loggerService = jasmine.createSpyObj<LoggerService>('LoggerService', ['errorWithPrefix']);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [TenantListComponent],
      providers: [
        { provide: TenantService, useValue: tenantService },
        { provide: AuthService, useValue: authService },
        { provide: PermissionService, useValue: permissionService },
        { provide: LoggerService, useValue: loggerService },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TenantListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
