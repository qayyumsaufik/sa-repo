import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventTypeListComponent } from './eventtype-list.component';
import { EventTypeService } from '../../services/eventtype.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('EventTypeListComponent', () => {
  beforeEach(async () => {
    const eventTypeService = jasmine.createSpyObj<EventTypeService>('EventTypeService', ['getEventTypes', 'createEventType', 'updateEventType', 'deleteEventType']);
    eventTypeService.getEventTypes.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [EventTypeListComponent],
      providers: [
        { provide: EventTypeService, useValue: eventTypeService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EventTypeListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
