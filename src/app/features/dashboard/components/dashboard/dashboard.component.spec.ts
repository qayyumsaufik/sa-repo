import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { SiteService } from '../../../sites/services/site.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

describe('DashboardComponent', () => {
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
    const siteService = jasmine.createSpyObj<SiteService>('SiteService', ['getSites']);
    siteService.getSites.and.returnValue(of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 1000 }));
    const permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasPermission']);
    permissionService.hasPermission.and.returnValue(true);
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
        { provide: SiteService, useValue: siteService },
        { provide: PermissionService, useValue: permissionService },
        { provide: Router, useValue: router },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
