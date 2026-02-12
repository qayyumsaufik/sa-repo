import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { SidebarService } from './services/sidebar.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AsyncPipe, SidebarComponent, HeaderComponent, ConfirmDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-confirmDialog></p-confirmDialog>
    @if (isAuthenticated$ | async) {
      <app-sidebar />
      <app-header />
      <main class="main-content" [class.sidebar-collapsed]="sidebarService.isCollapsed()">
        <router-outlet></router-outlet>
      </main>
    } @else {
      <main class="main-content no-sidebar">
        <router-outlet></router-outlet>
      </main>
    }
  `,
  styles: [`
    .main-content {
      margin-left: 280px;
      margin-top: 64px;
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background-color: #f8fafc;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content.sidebar-collapsed {
      margin-left: 80px;
    }

    .main-content.no-sidebar {
      margin-left: 0;
      margin-top: 0;
      min-height: 100vh;
      padding: 2rem;
    }
  `]
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected sidebarService = inject(SidebarService);
  isAuthenticated$ = this.authService.isAuthenticated$;
}
