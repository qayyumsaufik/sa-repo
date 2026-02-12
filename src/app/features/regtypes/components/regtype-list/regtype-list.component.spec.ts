import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegTypeListComponent } from './regtype-list.component';
import { RegTypeService } from '../../services/regtype.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('RegTypeListComponent', () => {
  beforeEach(async () => {
    const regTypeService = jasmine.createSpyObj<RegTypeService>('RegTypeService', ['getRegTypes', 'createRegType', 'updateRegType', 'deleteRegType']);
    regTypeService.getRegTypes.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [RegTypeListComponent],
      providers: [
        { provide: RegTypeService, useValue: regTypeService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmationService, useValue: confirmationService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegTypeListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
