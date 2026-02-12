import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SensorListComponent } from './sensor-list.component';
import { SensorService } from '../../services/sensor.service';
import { DeviceService } from '../../../devices/services/device.service';
import { RegTypeService } from '../../../regtypes/services/regtype.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ConfirmationService } from 'primeng/api';

describe('SensorListComponent', () => {
  beforeEach(async () => {
    const sensorService = jasmine.createSpyObj<SensorService>('SensorService', ['getSensors', 'createSensor', 'updateSensor', 'deleteSensor']);
    sensorService.getSensors.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const deviceService = jasmine.createSpyObj<DeviceService>('DeviceService', ['getDevices']);
    deviceService.getDevices.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const regTypeService = jasmine.createSpyObj<RegTypeService>('RegTypeService', ['getRegTypes']);
    regTypeService.getRegTypes.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [SensorListComponent],
      providers: [
        { provide: SensorService, useValue: sensorService },
        { provide: DeviceService, useValue: deviceService },
        { provide: RegTypeService, useValue: regTypeService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmationService, useValue: confirmationService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SensorListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
