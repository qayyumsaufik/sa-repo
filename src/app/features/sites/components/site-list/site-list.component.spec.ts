import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SiteListComponent } from './site-list.component';
import { SiteService } from '../../services/site.service';
import { ZoneService } from '../../../zones/services/zone.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ConfirmationService } from 'primeng/api';

describe('SiteListComponent', () => {
  beforeEach(async () => {
    const siteService = jasmine.createSpyObj<SiteService>('SiteService', ['getSites', 'createSite', 'updateSite', 'deleteSite']);
    siteService.getSites.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const zoneService = jasmine.createSpyObj<ZoneService>('ZoneService', ['getZones']);
    zoneService.getZones.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [SiteListComponent],
      providers: [
        { provide: SiteService, useValue: siteService },
        { provide: ZoneService, useValue: zoneService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmationService, useValue: confirmationService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SiteListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
