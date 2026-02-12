import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview';
import { DropdownModule, DropdownChangeEvent } from 'primeng/dropdown';
import { MultiSelectModule, MultiSelectChangeEvent } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardService } from '../../services/dashboard.service';
import { SiteService } from '../../../sites/services/site.service';
import { DashboardData, GetDashboardDataParams } from '../../../../shared/models/dashboard.model';
import { Site } from '../../../../shared/models/site.model';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { LevelChartComponent } from '../level-chart/level-chart.component';
import { AmpsChartComponent } from '../amps-chart/amps-chart.component';
import { StateTransitionChartComponent } from '../state-transition-chart/state-transition-chart.component';
import { EventsChartComponent } from '../events-chart/events-chart.component';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TabViewModule,
    DropdownModule,
    MultiSelectModule,
    CardModule,
    TagModule,
    TableModule,
    TooltipModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    LevelChartComponent,
    AmpsChartComponent,
    StateTransitionChartComponent,
    EventsChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.css']
})
export class SiteDetailComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  currentView = signal(0); // 0 = engineering, 1 = operator
  selectedSite = signal<Site | null>(null);
  siteId = signal<number | null>(null);
  
  // Filter options
  timeRange = signal<string>('3'); // Last 3 Hours, 12 Hours, 24 Hours
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Multi-selects for charts
  selectedLevelSensors = signal<number[]>([]);
  selectedAmpsSensors = signal<number[]>([]);
  selectedStateVariable = signal<string>('');

  // Dropdown options
  sites = signal<Site[]>([]);
  timeRangeOptions = [
    { label: 'Last 3 Hours', value: '3' },
    { label: 'Last 12 Hours', value: '12' },
    { label: 'Last 24 Hours', value: '24' }
  ];

  // Computed dropdown options
  siteOptions = computed(() => this.sites().map(s => ({label: s.name, value: s.id})));
  levelSensorOptions = computed(() => this.currentLevelReadings().map(r => ({label: r.sensorName, value: r.sensorId})));
  ampsSensorOptions = computed(() => this.currentAmpsReadings().map(r => ({label: r.sensorName, value: r.sensorId})));
  stateVariableOptions = [
    {label: 'All', value: ''},
    {label: 'Pump Status', value: 'Pump Status'},
    {label: 'Valve Control', value: 'Valve Control'},
    {label: 'Alarm Trigger', value: 'Alarm Trigger'}
  ];

  private dashboardService = inject(DashboardService);
  private siteService = inject(SiteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);

  // Computed signals
  summary = computed(() => this.dashboardData()?.summary);
  currentLevelReadings = computed(() => this.dashboardData()?.currentLevelReadings ?? []);
  currentAmpsReadings = computed(() => this.dashboardData()?.currentAmpsReadings ?? []);
  levelChartData = computed(() => this.dashboardData()?.levelChartData ?? []);
  ampsChartData = computed(() => this.dashboardData()?.ampsChartData ?? []);
  stateTransitions = computed(() => this.dashboardData()?.stateTransitions ?? []);
  eventsChartData = computed(() => this.dashboardData()?.eventsChartData ?? []);

  ngOnInit(): void {
    // Get site ID from route
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = parseInt(params['id'], 10);
        if (id) {
          this.siteId.set(id);
          this.loadSite(id);
          this.updateDateRange();
          this.loadDashboardData();
        }
      });

    this.loadSites();
  }

  loadSites(): void {
    this.siteService.getSites({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.sites.set(result.items),
        error: (err) => this.errorService.setErrorFromHttp(err)
      });
  }

  loadSite(id: number): void {
    this.siteService.getSiteById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (site) => this.selectedSite.set(site),
        error: (err) => this.errorService.setErrorFromHttp(err)
      });
  }

  loadDashboardData(): void {
    if (!this.siteId()) return;

    this.loadingService.startLoading();
    this.errorService.clearError();

    const params: GetDashboardDataParams = {
      siteId: this.siteId()!,
      startDate: this.startDate(),
      endDate: this.endDate()
    };

    this.dashboardService.getDashboardData(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          // Auto-select all sensors for charts
          if (data.currentLevelReadings.length > 0) {
            this.selectedLevelSensors.set(data.currentLevelReadings.map(r => r.sensorId));
          }
          if (data.currentAmpsReadings.length > 0) {
            this.selectedAmpsSensors.set(data.currentAmpsReadings.map(r => r.sensorId));
          }
          this.loadingService.stopLoading();
        },
        error: (err) => {
          this.errorService.setErrorFromHttp(err);
          this.loadingService.stopLoading();
        }
      });
  }

  setView(event: TabViewChangeEvent | number): void {
    const index = typeof event === 'number' ? event : event.index;
    this.currentView.set(index);
  }

  onSiteChange(event: DropdownChangeEvent | number): void {
    const siteId = typeof event === 'number' ? event : event.value;
    this.siteId.set(siteId);
    this.loadSite(siteId);
    this.loadDashboardData();
  }

  onTimeRangeSelect(event: DropdownChangeEvent | string): void {
    const value = typeof event === 'string' ? event : event.value;
    this.timeRange.set(value);
    this.onTimeRangeChange();
  }

  updateDateRange(): void {
    const hours = parseInt(this.timeRange());
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);
    
    this.endDate.set(endDate.toISOString().split('T')[0]);
    this.startDate.set(startDate.toISOString().split('T')[0]);
  }

  onTimeRangeChange(): void {
    this.updateDateRange();
    this.loadDashboardData();
  }

  onLevelSensorsSelect(event: MultiSelectChangeEvent | number[]): void {
    const values = Array.isArray(event) ? event : event.value;
    this.selectedLevelSensors.set(values);
  }

  onAmpsSensorsSelect(event: MultiSelectChangeEvent | number[]): void {
    const values = Array.isArray(event) ? event : event.value;
    this.selectedAmpsSensors.set(values);
  }

  filteredLevelChartData = computed(() => {
    const all = this.levelChartData();
    const selected = this.selectedLevelSensors();
    if (selected.length === 0) return all;
    return all.filter(d => selected.includes(d.sensorId));
  });

  filteredAmpsChartData = computed(() => {
    const all = this.ampsChartData();
    const selected = this.selectedAmpsSensors();
    if (selected.length === 0) return all;
    return all.filter(d => selected.includes(d.sensorId));
  });

  getCurrentLevelValue(): string {
    const readings = this.currentLevelReadings();
    if (readings.length > 0 && readings[0].currentValue) {
      return readings[0].currentValue;
    }
    return 'N/A';
  }

  getCurrentAmpsValue(): string {
    const readings = this.currentAmpsReadings();
    if (readings.length > 0 && readings[0].currentValue) {
      return readings[0].currentValue;
    }
    return 'N/A';
  }

  getSiteStatus(): string {
    const site = this.selectedSite();
    if (!site) return 'Unknown';
    return site.siteStatus?.currentStatus || 'Green';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Green': return 'success';
      case 'Yellow': return 'warn';
      case 'Red': return 'danger';
      default: return 'info';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  clearError = (): void => {
    this.errorService.clearError();
  };
}
