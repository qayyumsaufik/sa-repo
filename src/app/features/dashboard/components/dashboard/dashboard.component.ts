import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DashboardService } from '../../services/dashboard.service';
import { SiteService } from '../../../sites/services/site.service';
import { DashboardData, GetDashboardDataParams, SiteOverview } from '../../../../shared/models/dashboard.model';
import { Site } from '../../../../shared/models/site.model';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    TooltipModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  
  // Site Overview pagination
  currentPage = signal<number>(0);
  itemsPerPage = signal<number>(10);

  // Dropdown options
  sites = signal<Site[]>([]);

  private dashboardService = inject(DashboardService);
  private siteService = inject(SiteService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);

  // Permission checks
  canViewDashboard = computed(() => this.permissionService.hasPermission('View Sites'));

  // Computed signals
  summary = computed(() => this.dashboardData()?.summary);
  siteOverview = computed(() => this.dashboardData()?.siteOverview ?? []);

  // Summary counts
  normalSites = computed(() => this.summary()?.greenSites ?? 0);
  alarmedSites = computed(() => (this.summary()?.redSites ?? 0) + (this.summary()?.yellowSites ?? 0));

  ngOnInit(): void {
    this.loadSites();
    this.loadDashboardData();
  }

  loadSites(): void {
    this.siteService.getSites({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.sites.set(result.items);
        },
        error: (err) => this.errorService.setErrorFromHttp(err)
      });
  }

  loadDashboardData(): void {
    if (!this.canViewDashboard()) {
      this.errorService.setError('You do not have permission to view dashboard.');
      return;
    }

    this.loadingService.startLoading();
    this.errorService.clearError();

    const params: GetDashboardDataParams = {};

    this.dashboardService.getDashboardData(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboardData.set(data);
          this.loadingService.stopLoading();
        },
        error: (err) => {
          this.errorService.setErrorFromHttp(err);
          this.loadingService.stopLoading();
        }
      });
  }

  viewSiteDetails(siteId: number): void {
    // Navigate to site detail page with Engineering/Operator views
    this.router.navigate(['/dashboard/site', siteId]);
  }

  // Pagination
  onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.itemsPerPage.set(event.rows);
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Green': return 'success';
      case 'Yellow': return 'warn';
      case 'Red': return 'danger';
      default: return 'info';
    }
  }

  trackBySiteId(index: number, site: SiteOverview): number {
    return site.siteId;
  }

  clearError = (): void => {
    this.errorService.clearError();
  };
}
