import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      user$: of({ name: 'Test User', email: 'user@test.com' })
    });
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/dashboard' });
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PermissionService, useValue: permissionService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show RegTypes and EventTypes for system settings permission', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    const component = fixture.componentInstance;
    const permissionService = TestBed.inject(PermissionService);

    (permissionService.hasPermission as jasmine.Spy).and.callFake((permission: string) => {
      return permission === 'View System Settings';
    });

    const labels = component.menuItems().map(item => item.label);

    expect(labels).toContain('RegTypes');
    expect(labels).toContain('EventTypes');
  });
});
