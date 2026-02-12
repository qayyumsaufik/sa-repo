import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from './core/services/permission.service';
import { LoggerService } from './core/services/logger.service';
import { ConfirmationService } from 'primeng/api';

describe('AppComponent', () => {
  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['syncUser'], {
      isAuthenticated$: of(true),
      user$: of({ email: 'user@test.com' })
    });
    authService.syncUser.and.returnValue(of({
      userId: 1,
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['Admin'],
      permissions: ['View Sites'],
      isNewUser: false
    }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['setPermissions']);
    const loggerService = jasmine.createSpyObj<LoggerService>('LoggerService', ['errorWithPrefix']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PermissionService, useValue: permissionService },
        { provide: LoggerService, useValue: loggerService },
        ConfirmationService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
