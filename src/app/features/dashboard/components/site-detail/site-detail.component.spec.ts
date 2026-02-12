import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteDetailComponent } from './site-detail.component';
import { DashboardService } from '../../services/dashboard.service';
import { SiteService } from '../../../sites/services/site.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { MessageService } from 'primeng/api';

describe('SiteDetailComponent', () => {
  beforeEach(async () => {
    const dashboardService = jasmine.createSpyObj<DashboardService>('DashboardService', ['getDashboardData']);
    dashboardService.getDashboardData.and.returnValue(of({
      summary: {
        totalSites: 0,
        totalDevices: 0,
        totalSensors: 0,
        activeEvents: 0,
        greenSites: 0,
        yellowSites: 0,
        redSites: 0
      },
      siteOverview: [],
      levelChartData: [],
      ampsChartData: [],
      currentLevelReadings: [],
      currentAmpsReadings: [],
      stateTransitions: [],
      eventsChartData: [],
      categoryBreakdown: []
    }));
    const siteService = jasmine.createSpyObj<SiteService>('SiteService', ['getSites', 'getSiteById']);
    siteService.getSites.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    siteService.getSiteById.and.returnValue(of({ id: 1, name: 'Site', zoneId: 1, zoneName: 'Zone', createdDate: '2024-01-01' }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const route = { params: of({ id: '1' }) } as any as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [SiteDetailComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
        { provide: SiteService, useValue: siteService },
        { provide: PermissionService, useValue: permissionService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SiteDetailComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
