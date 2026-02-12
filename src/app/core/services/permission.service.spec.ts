import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionService]
    });
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and check permissions', () => {
    service.setPermissions(['View Sites', 'Manage Devices']);
    expect(service.hasPermission('View Sites')).toBeTrue();
    expect(service.hasPermission('Manage Devices')).toBeTrue();
    expect(service.hasPermission('View Devices')).toBeTrue(); // Manage implies View
    expect(service.hasPermission('Missing')).toBeFalse();
  });

  it('should check any and all permissions', () => {
    service.setPermissions(['A', 'B']);
    expect(service.hasAnyPermission(['C', 'B'])).toBeTrue();
    expect(service.hasAllPermissions(['A', 'B'])).toBeTrue();
    expect(service.hasAllPermissions(['A', 'C'])).toBeFalse();
  });

  it('should clear permissions', () => {
    service.setPermissions(['A']);
    service.clearPermissions();
    expect(service.getPermissions()).toEqual([]);
  });
});
