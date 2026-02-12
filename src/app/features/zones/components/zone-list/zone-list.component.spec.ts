import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ZoneListComponent } from './zone-list.component';
import { ZoneService } from '../../services/zone.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { of, throwError } from 'rxjs';
import { Zone } from '../../../../shared/models/zone.model';
import { MessageService, ConfirmationService } from 'primeng/api';

describe('ZoneListComponent', () => {
  let component: ZoneListComponent;
  let fixture: ComponentFixture<ZoneListComponent>;
  let zoneService: jasmine.SpyObj<ZoneService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  const mockZones: Zone[] = [
    { id: 1, name: 'Zone 1', description: 'Description 1', createdDate: '2024-01-01' },
    { id: 2, name: 'Zone 2', description: 'Description 2', createdDate: '2024-01-02' }
  ];
  const mockZonesResult = {
    items: mockZones,
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    const zoneServiceSpy = jasmine.createSpyObj('ZoneService', ['getZones', 'createZone', 'updateZone', 'deleteZone']);
    zoneServiceSpy.getZones.and.returnValue(of(mockZonesResult));
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['setError', 'setErrorFromHttp', 'clearError'], {
      error: jasmine.createSpy().and.returnValue(null)
    });
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['startLoading', 'stopLoading'], {
      loading: jasmine.createSpy().and.returnValue(false)
    });
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true)
    });
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission'], {
      hasPermission: jasmine.createSpy().and.returnValue(true)
    });
    const loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['errorWithPrefix']);

    await TestBed.configureTestingModule({
      imports: [ZoneListComponent],
      providers: [
        { provide: ZoneService, useValue: zoneServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ZoneListComponent);
    component = fixture.componentInstance;
    zoneService = TestBed.inject(ZoneService) as jasmine.SpyObj<ZoneService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    permissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load zones on init', () => {
    zoneService.getZones.and.returnValue(of(mockZonesResult));
    
    fixture.detectChanges();
    
    expect(zoneService.getZones).toHaveBeenCalled();
    expect(loadingService.startLoading).toHaveBeenCalled();
    expect(loadingService.stopLoading).toHaveBeenCalled();
    expect(component.zones().length).toBe(2);
  });

  it('should handle error when loading zones fails', () => {
    const error = { message: 'Error loading zones' };
    zoneService.getZones.and.returnValue(throwError(() => error));
    
    fixture.detectChanges();
    
    expect(errorService.setErrorFromHttp).toHaveBeenCalledWith(error);
    expect(loadingService.stopLoading).toHaveBeenCalled();
  });

  it('should show create form', () => {
    component.showCreateForm();
    
    expect(component.showModal()).toBeTrue();
    expect(component.editingZone()).toBeNull();
    expect(component.formData.name).toBe('');
  });

  it('should edit zone', () => {
    const zone = mockZones[0];
    component.editZone(zone);
    
    expect(component.editingZone()).toEqual(zone);
    expect(component.formData.name).toBe(zone.name);
    expect(component.formData.description).toBe(zone.description);
    expect(component.showModal()).toBeTrue();
  });

  it('should close modal', () => {
    component.showModal.set(true);
    component.editingZone.set(mockZones[0]);
    
    component.closeModal();
    
    expect(component.showModal()).toBeFalse();
    expect(component.editingZone()).toBeNull();
  });

  it('should check permissions for managing zones', () => {
    permissionService.hasPermission.and.returnValue(true);
    fixture.detectChanges();
    
    expect(component.canManageZones()).toBeTrue();
  });
});
