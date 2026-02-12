import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventListComponent } from './event-list.component';
import { EventService } from '../../services/event.service';
import { EventTypeService } from '../../../eventtypes/services/eventtype.service';
import { SensorService } from '../../../sensors/services/sensor.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('EventListComponent', () => {
  beforeEach(async () => {
    const eventService = jasmine.createSpyObj<EventService>('EventService', ['getEvents', 'getEventById', 'getUnresolvedEventsCount', 'resolveEvent', 'deleteEvent']);
    eventService.getEvents.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    eventService.getUnresolvedEventsCount.and.returnValue(of(0));
    const eventTypeService = jasmine.createSpyObj<EventTypeService>('EventTypeService', ['getEventTypes']);
    eventTypeService.getEventTypes.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const sensorService = jasmine.createSpyObj<SensorService>('SensorService', ['getSensors']);
    sensorService.getSensors.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const loggerService = jasmine.createSpyObj<LoggerService>('LoggerService', ['warn']);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        { provide: EventService, useValue: eventService },
        { provide: EventTypeService, useValue: eventTypeService },
        { provide: SensorService, useValue: sensorService },
        { provide: PermissionService, useValue: permissionService },
        { provide: LoggerService, useValue: loggerService },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EventListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
