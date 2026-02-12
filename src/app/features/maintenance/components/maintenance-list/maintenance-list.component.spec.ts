import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MaintenanceListComponent } from './maintenance-list.component';
import { MaintenanceService } from '../../services/maintenance.service';
import { SensorService } from '../../../sensors/services/sensor.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { MessageService } from 'primeng/api';

describe('MaintenanceListComponent', () => {
  beforeEach(async () => {
    const maintenanceService = jasmine.createSpyObj<MaintenanceService>('MaintenanceService', ['getMaintenances', 'getMaintenanceById', 'createMaintenance', 'deleteMaintenance']);
    maintenanceService.getMaintenances.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const sensorService = jasmine.createSpyObj<SensorService>('SensorService', ['getSensors']);
    sensorService.getSensors.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [MaintenanceListComponent],
      providers: [
        { provide: MaintenanceService, useValue: maintenanceService },
        { provide: SensorService, useValue: sensorService },
        { provide: PermissionService, useValue: permissionService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MaintenanceListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
