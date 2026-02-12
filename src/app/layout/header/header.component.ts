import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ToolbarModule,
    ButtonModule,
    MenuModule,
    BadgeModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  protected sidebarService = inject(SidebarService);

  private user$ = toSignal(this.authService.user$, { initialValue: null });
  
  user = computed(() => {
    const authUser = this.user$();
    if (!authUser) return null;
    return {
      name: authUser.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      initial: (authUser.name || authUser.email || 'U')[0].toUpperCase()
    };
  });

  userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/profile'
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ]);

  headerStyle = computed(() => ({
    position: 'fixed',
    top: '0',
    left: this.sidebarService.isCollapsed() ? '80px' : '280px',
    right: '0',
    height: '64px',
    'z-index': '999',
    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    'padding-left': '1.5rem',
    'padding-right': '1.5rem',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between'
  }));

  logout(): void {
    this.authService.logout();
  }
}
