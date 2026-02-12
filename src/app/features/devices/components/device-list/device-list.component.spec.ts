import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DeviceListComponent } from './device-list.component';
import { DeviceService } from '../../services/device.service';
import { SiteService } from '../../../sites/services/site.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ConfirmationService } from 'primeng/api';

describe('DeviceListComponent', () => {
  beforeEach(async () => {
    const deviceService = jasmine.createSpyObj<DeviceService>('DeviceService', ['getDevices', 'createDevice', 'updateDevice', 'deleteDevice']);
    deviceService.getDevices.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const siteService = jasmine.createSpyObj<SiteService>('SiteService', ['getSites']);
    siteService.getSites.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [DeviceListComponent],
      providers: [
        { provide: DeviceService, useValue: deviceService },
        { provide: SiteService, useValue: siteService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmationService, useValue: confirmationService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DeviceListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
