import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReadingListComponent } from './reading-list.component';
import { ReadingService } from '../../services/reading.service';
import { SensorService } from '../../../sensors/services/sensor.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { MessageService } from 'primeng/api';

describe('ReadingListComponent', () => {
  beforeEach(async () => {
    const readingService = jasmine.createSpyObj<ReadingService>('ReadingService', ['getReadings', 'getReadingById', 'getLatestReading']);
    readingService.getReadings.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    readingService.getLatestReading.and.returnValue(of({
      id: 1,
      sensorId: 1,
      sensorName: 'Sensor',
      timestamp: '2024-01-01',
      values: [],
      createdDate: '2024-01-01'
    }));
    const sensorService = jasmine.createSpyObj<SensorService>('SensorService', ['getSensors']);
    sensorService.getSensors.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const loggerService = jasmine.createSpyObj<LoggerService>('LoggerService', ['warn']);

    await TestBed.configureTestingModule({
      imports: [ReadingListComponent],
      providers: [
        { provide: ReadingService, useValue: readingService },
        { provide: SensorService, useValue: sensorService },
        { provide: PermissionService, useValue: permissionService },
        { provide: LoggerService, useValue: loggerService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReadingListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
