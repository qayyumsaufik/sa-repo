import { Component, ChangeDetectionStrategy, ViewEncapsulation, inject, computed, ChangeDetectorRef, signal, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { SidebarService } from '../services/sidebar.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MenuItem } from 'primeng/api';
import { filter, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TenantService } from '../../features/tenants/services/tenant.service';
import { Tenant } from '../../shared/models/tenant.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MenuModule,
    ButtonModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  protected sidebarService = inject(SidebarService);
  private tenantService = inject(TenantService);

  isCollapsed = this.sidebarService.isCollapsed;
  private user$ = toSignal(this.authService.user$, { initialValue: null });
  /** Tenants list for SuperAdmin Users submenu; loaded only when needed (SuperAdmin sees tenants) */
  private tenantList = toSignal(
    this.tenantService.getTenants(1, 500).pipe(
      map(r => r.items),
      catchError(() => of<Tenant[]>([]))
    ),
    { initialValue: [] as Tenant[] }
  );
  
  // State management for Devices submenu
  private isDevicesMenuHovered = signal<boolean>(false);
  private hoverTimeoutId?: number;
  
  // Devices-related routes
  private readonly devicesRoutes = ['/zones', '/sites', '/devices', '/sensors', '/readings'];
  
  // Check if any Devices route is currently active
  isDevicesRouteActive = computed(() => {
    const currentUrl = this.router.url.split('?')[0].split('#')[0]; // Remove query params and hash
    const isActive = this.devicesRoutes.some(route => 
      currentUrl === route || currentUrl.startsWith(route + '/')
    );
    return isActive;
  });
  
  // Combined state: menu should be open if hovered OR if a Devices route is active
  isDevicesMenuOpen = computed(() => {
    return this.isDevicesMenuHovered() || this.isDevicesRouteActive();
  });
  
  @ViewChild('menu', { read: ElementRef }) menuElementRef?: ElementRef;
  @ViewChild('menu') menuComponent?: Menu;
  private devicesMenuItemElement: HTMLElement | null = null;
  private devicesSubmenuElement: HTMLElement | null = null;
  private hoverListeners: { element: HTMLElement; enter: () => void; leave: () => void } | null = null;
  private mutationObserver?: MutationObserver;
  private hideCheckInterval?: number;
  
  user = computed(() => {
    const authUser = this.user$();
    if (!authUser) return null;
    return {
      name: authUser.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      initial: (authUser.name || authUser.email || 'U')[0].toUpperCase()
    };
  });
  
  constructor() {
    // Subscribe to router events to update state when route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // When route changes, update hover state based on active route
        // If we navigate away from Devices routes, close the menu (unless hovered)
        if (!this.isDevicesRouteActive() && !this.isDevicesMenuHovered()) {
          this.isDevicesMenuHovered.set(false);
        }
        // Force update visibility on route change
        setTimeout(() => {
          this.forceHideDevicesSubmenu();
          this.updateDevicesSubmenuVisibility();
        }, 0);
        this.cdr.markForCheck();
      });
    
    // Watch for state changes and update visibility
    effect(() => {
      // Access the computed to create dependency
      const isOpen = this.isDevicesMenuOpen();
      // Always force update visibility
      setTimeout(() => {
        this.updateDevicesSubmenuVisibility();
      }, 0);
    });
    
    // Watch for menu items changes and refresh listeners
    effect(() => {
      // Access menuItems to create a dependency
      this.menuItems();
      // Refresh listeners after a short delay to allow DOM to update
      if (this.menuElementRef) {
        setTimeout(() => {
          this.updateMenuRoles();
          this.setupAllMenuClickHandlers();
          this.refreshMenuListeners();
        }, 100);
      }
    });
    
    // Initial check - ensure menu is closed on load if not on Devices route
    setTimeout(() => {
      if (!this.isDevicesRouteActive()) {
        this.isDevicesMenuHovered.set(false);
      }
    }, 0);
  }
  
  ngAfterViewInit(): void {
    // Update roles and structure after view initialization
    setTimeout(() => {
      this.updateMenuRoles();
      this.setupAllMenuClickHandlers();
      this.setupDevicesMenuHoverListeners();
      // Ensure submenu is hidden on initial load
      this.forceHideDevicesSubmenu();
    }, 0);
    
    // Also check after a longer delay to catch any PrimeNG initialization
    setTimeout(() => {
      this.updateMenuRoles();
      this.setupAllMenuClickHandlers();
      this.setupDevicesMenuHoverListeners();
      this.forceHideDevicesSubmenu();
    }, 100);
    
    // Keep checking periodically to catch any late PrimeNG changes
    setTimeout(() => {
      this.updateMenuRoles();
      this.setupAllMenuClickHandlers();
      this.setupDevicesMenuHoverListeners();
      this.forceHideDevicesSubmenu();
    }, 300);
    
    setTimeout(() => {
      this.updateMenuRoles();
      this.setupAllMenuClickHandlers();
      this.setupDevicesMenuHoverListeners();
      this.forceHideDevicesSubmenu();
    }, 600);
    
    // Set up continuous check to ensure submenu stays hidden when it should be
    this.hideCheckInterval = window.setInterval(() => {
      if (!this.isDevicesMenuOpen()) {
        this.forceHideDevicesSubmenu();
      }
    }, 50); // Check every 50ms
  }
  
  private setupAllMenuClickHandlers(): void {
    if (!this.menuElementRef?.nativeElement) return;
    
    const menuElement = this.menuElementRef.nativeElement;
    const allParentItems = Array.from(menuElement.querySelectorAll('.p-menu-submenu-label')) as HTMLElement[];
    
    // Map of menu labels to routes
    const menuRoutes: { [key: string]: string } = {
      'Dashboard': '/dashboard',
      'Devices': '/devices',
      'Events': '/events',
      'Maintenance': '/maintenance',
      'RegTypes': '/regtypes',
      'EventTypes': '/eventtypes',
      'Users': '/users',
      'Tenants': '/tenants',
      'Notifications': '/notifications',
      'Support': '/support',
      'Admin Settings': '/admin-settings', // Default route for Admin Settings
      'Settings': '/settings'
    };
    
    allParentItems.forEach((item: HTMLElement) => {
      const span = item.querySelector('span');
      const label = span?.textContent?.trim();
      
      if (label && menuRoutes[label]) {
        const route = menuRoutes[label];
        
        // Find the clickable element (could be the label itself, a link, or the parent li)
        const clickableElement = item.closest('a') || item.querySelector('a') || item.closest('li') || item;
        
        // Remove existing handler if any
        const handlerKey = `__menuClickHandler_${label}`;
        const existingHandler = (clickableElement as any)[handlerKey];
        if (existingHandler) {
          clickableElement.removeEventListener('click', existingHandler);
        }
        
        // Add new click handler
        const clickHandler = (e: MouseEvent) => {
          // Don't navigate if clicking on toggle icon/arrow (only for items with submenus)
          const target = e.target as HTMLElement;
          const hasSubmenu = item.closest('li')?.querySelector('.p-submenu-list, .devices-submenu-wrapper');
          
          if (hasSubmenu && target.closest('.p-menu-toggle-icon, .p-menuitem-toggle-icon, .p-submenu-icon, .p-menu-toggle')) {
            // Allow toggle to work, but also navigate
            // For Devices, we want hover to open, so we'll navigate on click
            if (label === 'Devices') {
              e.preventDefault();
              e.stopPropagation();
              this.router.navigate([route]);
            }
            // For Admin Settings and Users (when it has submenu), just let the toggle work (don't navigate)
            if (label === 'Admin Settings') {
              return; // Just open/close submenu, don't navigate
            }
            if (label === 'Users' && hasSubmenu) {
              return; // Users with submenu (SuperAdmin): open submenu only
            }
            // For other items with submenus, let the toggle work
            return;
          }
          
          // For Admin Settings, don't navigate on parent click - submenu opens on toggle
          if (label === 'Admin Settings') {
            return; // Don't navigate, submenu opens on click
          }
          // For Users with submenu (SuperAdmin), don't navigate on parent click
          if (label === 'Users' && hasSubmenu) {
            return; // Don't navigate, submenu opens on click
          }
          
          // Navigate for all other cases
          e.preventDefault();
          e.stopPropagation();
          this.router.navigate([route]);
        };
        
        clickableElement.addEventListener('click', clickHandler);
        (clickableElement as any)[handlerKey] = clickHandler;
      }
    });
  }
  
  private updateMenuRoles(): void {
    if (!this.menuElementRef?.nativeElement) return;
    
    const menuElement = this.menuElementRef.nativeElement;
    
    // 1. Ensure main menu ul has role="menu"
    const mainMenuList = menuElement.querySelector('.p-menu-list');
    if (mainMenuList) {
      mainMenuList.setAttribute('role', 'menu');
    }
    
    // 2. Update all li elements (parent menu items) to have role="menuitem"
    const parentMenuItems = menuElement.querySelectorAll('.p-menu-submenu-label');
    parentMenuItems.forEach((item: HTMLElement) => {
      // Find the parent li element
      const liElement = item.closest('li') || item;
      if (liElement.tagName === 'LI') {
        liElement.setAttribute('role', 'menuitem');
      }
    });
    
    // 3. Update all submenu li elements to have role="menuitem" and ensure icons are visible
    const submenuItems = menuElement.querySelectorAll('.p-menu-item');
    submenuItems.forEach((item: HTMLElement) => {
      // Find the parent li element
      const liElement = item.closest('li') || item;
      if (liElement.tagName === 'LI') {
        liElement.setAttribute('role', 'menuitem');
      }
      // Ensure icons are visible
      const icons = item.querySelectorAll('.p-menuitem-icon, .p-menu-item-icon');
      icons.forEach((icon) => {
        const htmlIcon = icon as HTMLElement;
        htmlIcon.style.display = 'inline-block';
        htmlIcon.style.visibility = 'visible';
      });
    });
    
    // Ensure icons are visible for parent menu items too
    parentMenuItems.forEach((item: HTMLElement) => {
      const icons = item.querySelectorAll('.p-menuitem-icon, i[class*="pi-"]');
      icons.forEach((icon) => {
        const htmlIcon = icon as HTMLElement;
        htmlIcon.style.display = 'inline-block';
        htmlIcon.style.visibility = 'visible';
      });
      
      // If no icon exists, add one based on the label
      if (icons.length === 0) {
        const span = item.querySelector('span');
        const label = span?.textContent?.trim();
        if (label) {
          const iconMap: { [key: string]: string } = {
            'Dashboard': 'pi pi-home',
            'Devices': 'pi pi-desktop',
            'Events': 'pi pi-exclamation-triangle',
            'Maintenance': 'pi pi-wrench',
            'Users': 'pi pi-users',
            'Notifications': 'pi pi-bell',
            'Support': 'pi pi-question-circle',
            'Admin Settings': 'pi pi-sliders-h',
            'Settings': 'pi pi-cog'
          };
          
          const iconClass = iconMap[label];
          if (iconClass) {
            const iconElement = document.createElement('i');
            iconElement.className = iconClass;
            iconElement.style.marginRight = '1rem';
            iconElement.style.fontSize = '1.25rem';
            iconElement.style.width = '24px';
            iconElement.style.textAlign = 'center';
            iconElement.style.flexShrink = '0';
            iconElement.style.opacity = '0.9';
            iconElement.style.display = 'inline-block';
            iconElement.style.visibility = 'visible';
            
            if (span && span.parentElement) {
              span.parentElement.insertBefore(iconElement, span);
            }
          }
        }
      }
    });
    
    // Also ensure icons for regular menu items (without submenus) - these use .p-menuitem-link
    const menuLinks = menuElement.querySelectorAll('.p-menuitem-link');
    menuLinks.forEach((link: HTMLElement) => {
      // Check if this link is inside a submenu (skip those, they're handled above)
      if (link.closest('.p-submenu-list, .devices-submenu-wrapper, .admin-settings-submenu-wrapper')) {
        return;
      }
      
      const icons = link.querySelectorAll('.p-menuitem-icon, i[class*="pi-"]');
      icons.forEach((icon) => {
        const htmlIcon = icon as HTMLElement;
        htmlIcon.style.display = 'inline-block';
        htmlIcon.style.visibility = 'visible';
      });
      
      // If no icon exists, add one based on the label
      if (icons.length === 0) {
        const textElement = link.querySelector('.p-menuitem-text, span');
        const label = textElement?.textContent?.trim();
        if (label) {
          const iconMap: { [key: string]: string } = {
            'Dashboard': 'pi pi-home',
            'Events': 'pi pi-exclamation-triangle',
            'Maintenance': 'pi pi-wrench',
            'Users': 'pi pi-users',
            'Notifications': 'pi pi-bell',
            'Support': 'pi pi-question-circle',
            'Settings': 'pi pi-cog'
          };
          
          const iconClass = iconMap[label];
          if (iconClass) {
            const iconElement = document.createElement('i');
            iconElement.className = iconClass;
            iconElement.style.marginRight = '1rem';
            iconElement.style.fontSize = '1.25rem';
            iconElement.style.width = '24px';
            iconElement.style.textAlign = 'center';
            iconElement.style.flexShrink = '0';
            iconElement.style.opacity = '0.9';
            iconElement.style.display = 'inline-block';
            iconElement.style.visibility = 'visible';
            
            if (textElement && textElement.parentElement) {
              textElement.parentElement.insertBefore(iconElement, textElement);
            } else if (link) {
              link.insertBefore(iconElement, link.firstChild);
            }
          }
        }
      }
    });
    
    // 4. For Devices and Admin Settings menus, wrap submenu items in a role="menu" ul element
    const allParentItems = Array.from(menuElement.querySelectorAll('.p-menu-submenu-label')) as HTMLElement[];
    
    // Handle Devices menu
    const devicesParentItem = allParentItems.find((item: HTMLElement) => {
      const span = item.querySelector('span');
      return span && span.textContent?.trim() === 'Devices';
    });
    
    // Handle Admin Settings menu
    const adminSettingsParentItem = allParentItems.find((item: HTMLElement) => {
      const span = item.querySelector('span');
      return span && span.textContent?.trim() === 'Admin Settings';
    });
    
    if (devicesParentItem) {
      // Get the Devices parent li element
      const devicesParentLi = devicesParentItem.closest('li') as HTMLElement;
      
      // First, check if PrimeNG already created a .p-submenu-list structure
      const existingSubmenuList = devicesParentItem.querySelector('.p-submenu-list') as HTMLElement;
      
      if (existingSubmenuList) {
        // PrimeNG structure exists - just update its role and add our class
        existingSubmenuList.setAttribute('role', 'menu');
        existingSubmenuList.classList.add('devices-submenu-wrapper');
        this.devicesSubmenuElement = existingSubmenuList;
        
        // Ensure all li elements inside have role="menuitem"
        const submenuLis = existingSubmenuList.querySelectorAll('li');
        submenuLis.forEach((li: HTMLElement) => {
          li.setAttribute('role', 'menuitem');
        });
      } else {
        // Check if we already created our custom wrapper
        let submenuWrapper = devicesParentLi?.nextElementSibling as HTMLElement;
        
        if (submenuWrapper && submenuWrapper.classList.contains('devices-submenu-wrapper')) {
          // Already wrapped, just update role
          submenuWrapper.setAttribute('role', 'menu');
          this.devicesSubmenuElement = submenuWrapper;
          
          // Ensure all li elements inside have role="menuitem"
          const submenuLis = submenuWrapper.querySelectorAll('li');
          submenuLis.forEach((li: HTMLElement) => {
            li.setAttribute('role', 'menuitem');
          });
        } else {
          // Find all submenu items that belong to Devices
          // They should be the next siblings until we hit another parent menu item
          const submenuItems: HTMLElement[] = [];
          let nextSibling = devicesParentLi?.nextElementSibling;
          
          while (nextSibling) {
            // Stop if we hit another parent menu item
            if (nextSibling.classList.contains('p-menu-submenu-label') || 
                (nextSibling as HTMLElement).querySelector('.p-menu-submenu-label')) {
              break;
            }
            
            // Check if this is a Devices submenu item (it's an li with p-menu-item class)
            if (nextSibling.tagName === 'LI' && nextSibling.classList.contains('p-menu-item')) {
              // Verify it's a Devices submenu item by checking the text
              const link = nextSibling.querySelector('.p-menuitem-link');
              const text = link?.querySelector('.p-menuitem-text')?.textContent?.trim();
              if (text && ['Zones', 'Sites', 'Devices', 'Sensors', 'Readings'].includes(text)) {
                submenuItems.push(nextSibling as HTMLElement);
              }
            }
            
            nextSibling = nextSibling.nextElementSibling;
          }
          
          // If we found submenu items, wrap them
          if (submenuItems.length > 0) {
            // Create wrapper ul with role="menu"
            const wrapper = document.createElement('ul');
            wrapper.setAttribute('role', 'menu');
            wrapper.classList.add('devices-submenu-wrapper', 'p-submenu-list');
            wrapper.style.listStyle = 'none';
            wrapper.style.padding = '0';
            wrapper.style.margin = '0';
            
            // Insert wrapper after Devices parent li (before the first submenu item)
            devicesParentLi?.parentElement?.insertBefore(wrapper, submenuItems[0]);
            
            // Move all submenu items into the wrapper and ensure they have role="menuitem"
            submenuItems.forEach(item => {
              // Ensure the li has role="menuitem"
              item.setAttribute('role', 'menuitem');
              wrapper.appendChild(item);
            });
            
            // Store reference to the wrapper
            this.devicesSubmenuElement = wrapper;
          }
        }
      }
    }
    
    // Handle Admin Settings menu submenu
    if (adminSettingsParentItem) {
      // Get the Admin Settings parent li element
      const adminSettingsParentLi = adminSettingsParentItem.closest('li') as HTMLElement;
      
      // First, check if PrimeNG already created a .p-submenu-list structure
      const existingSubmenuList = adminSettingsParentItem.querySelector('.p-submenu-list') as HTMLElement;
      
      if (existingSubmenuList) {
        // PrimeNG structure exists - just update its role
        existingSubmenuList.setAttribute('role', 'menu');
        
        // Ensure all li elements inside have role="menuitem"
        const submenuLis = existingSubmenuList.querySelectorAll('li');
        submenuLis.forEach((li: HTMLElement) => {
          li.setAttribute('role', 'menuitem');
        });
      } else {
        // Find all submenu items that belong to Admin Settings
        const submenuItems: HTMLElement[] = [];
        let nextSibling = adminSettingsParentLi?.nextElementSibling;
        
        while (nextSibling) {
          // Stop if we hit another parent menu item
          if (nextSibling.classList.contains('p-menu-submenu-label') || 
              (nextSibling as HTMLElement).querySelector('.p-menu-submenu-label')) {
            break;
          }
          
          // Check if this is an Admin Settings submenu item
          if (nextSibling.tagName === 'LI' && nextSibling.classList.contains('p-menu-item')) {
            // Verify it's an Admin Settings submenu item by checking the text
            const link = nextSibling.querySelector('.p-menuitem-link');
            const text = link?.querySelector('.p-menuitem-text')?.textContent?.trim();
            if (text && ['EventTypes', 'RegTypes', 'Tenants'].includes(text)) {
              submenuItems.push(nextSibling as HTMLElement);
            }
          }
          
          nextSibling = nextSibling.nextElementSibling;
        }
        
        // If we found submenu items, wrap them
        if (submenuItems.length > 0) {
          // Create wrapper ul with role="menu"
          const wrapper = document.createElement('ul');
          wrapper.setAttribute('role', 'menu');
          wrapper.classList.add('admin-settings-submenu-wrapper', 'p-submenu-list');
          wrapper.style.listStyle = 'none';
          wrapper.style.padding = '0';
          wrapper.style.margin = '0';
          
          // Insert wrapper after Admin Settings parent li (before the first submenu item)
          adminSettingsParentLi?.parentElement?.insertBefore(wrapper, submenuItems[0]);
          
          // Move all submenu items into the wrapper and ensure they have role="menuitem"
          submenuItems.forEach(item => {
            // Ensure the li has role="menuitem"
            item.setAttribute('role', 'menuitem');
            wrapper.appendChild(item);
          });
        }
      }
    }
  }
  
  ngOnDestroy(): void {
    this.removeDevicesMenuHoverListeners();
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.hideCheckInterval) {
      clearInterval(this.hideCheckInterval);
    }
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
    }
  }
  
  private setupDevicesMenuHoverListeners(): void {
    if (!this.menuElementRef?.nativeElement) return;
    
    // Remove existing listeners first
    this.removeDevicesMenuHoverListeners();
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.devicesMenuItemElement = null;
    this.devicesSubmenuElement = null;
    
    // Find the Devices menu item by looking for the menu item with "Devices" label
    const menuElement = this.menuElementRef.nativeElement;
    // Parent menu items use p-menu-submenu-label class
    const menuItems = menuElement.querySelectorAll('.p-menu-submenu-label');
    
    for (const item of menuItems) {
      // Check for text in span (for parent menu items)
      const labelElement = item.querySelector('span');
      if (labelElement && labelElement.textContent?.trim() === 'Devices') {
        this.devicesMenuItemElement = item as HTMLElement;
        
        // Find the submenu wrapper (either our custom wrapper or PrimeNG's submenu list)
        let submenuList = item.querySelector('.p-submenu-list') as HTMLElement;
        
        // If not found as child, check if it's a sibling (our custom wrapper)
        if (!submenuList) {
          let nextSibling = item.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('devices-submenu-wrapper')) {
            submenuList = nextSibling as HTMLElement;
          }
        }
        
        // If we still don't have it, look for the wrapper we created
        if (!submenuList) {
          submenuList = menuElement.querySelector('.devices-submenu-wrapper') as HTMLElement;
        }
        
        // If we found a submenu list, set up the listeners
        if (submenuList) {
          this.devicesSubmenuElement = submenuList;
          
          // Add a class to identify this as the Devices menu item
          this.devicesMenuItemElement.classList.add('devices-menu-item');
          
          // Force hide the submenu initially (unless state says it should be open)
          this.updateDevicesSubmenuVisibility();
          
          // Set up MutationObserver to watch for any changes to the submenu
          this.setupMutationObserver();
          
          const enterHandler = () => this.onDevicesMenuEnter();
          const leaveHandler = () => this.onDevicesMenuLeave();
          
          // Add hover listeners to the menu item
          this.devicesMenuItemElement.addEventListener('mouseenter', enterHandler);
          this.devicesMenuItemElement.addEventListener('mouseleave', leaveHandler);
          
          // Also add hover listeners to the submenu itself to keep it open when hovering over submenu items
          const submenuEnterHandler = () => this.onDevicesMenuEnter();
          const submenuLeaveHandler = () => this.onDevicesMenuLeave();
          
          this.devicesSubmenuElement.addEventListener('mouseenter', submenuEnterHandler);
          this.devicesSubmenuElement.addEventListener('mouseleave', submenuLeaveHandler);
          
          this.hoverListeners = {
            element: this.devicesMenuItemElement,
            enter: enterHandler,
            leave: leaveHandler
          };
          
          // Store submenu listeners separately for cleanup
          (this.hoverListeners as any).submenuElement = this.devicesSubmenuElement;
          (this.hoverListeners as any).submenuEnter = submenuEnterHandler;
          (this.hoverListeners as any).submenuLeave = submenuLeaveHandler;
          
          break;
        }
      }
    }
  }
  
  private setupMutationObserver(): void {
    if (!this.devicesSubmenuElement) return;
    
    // Watch for any attribute or style changes that might show the submenu
    this.mutationObserver = new MutationObserver(() => {
      // If our state says it should be closed, force it closed
      if (!this.isDevicesMenuOpen()) {
        this.updateDevicesSubmenuVisibility();
      }
    });
    
    // Observe the submenu element for attribute and style changes
    this.mutationObserver.observe(this.devicesSubmenuElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: false,
      subtree: false
    });
    
    // Also observe the parent menu item for class changes
    if (this.devicesMenuItemElement) {
      this.mutationObserver.observe(this.devicesMenuItemElement, {
        attributes: true,
        attributeFilter: ['class'],
        childList: false,
        subtree: false
      });
    }
  }
  
  private forceHideDevicesSubmenu(): void {
    if (!this.menuElementRef?.nativeElement) return;
    
    // Find all submenu lists and hide the Devices one specifically
    const menuElement = this.menuElementRef.nativeElement;
    const allSubmenus = menuElement.querySelectorAll('.p-submenu-list, .devices-submenu-wrapper');
    
    allSubmenus.forEach((submenu: HTMLElement) => {
      // Check if this is the Devices submenu wrapper
      const isDevicesWrapper = submenu.classList.contains('devices-submenu-wrapper');
      
      // Check if this submenu belongs to Devices menu item
      let isDevicesSubmenu = false;
      if (isDevicesWrapper) {
        isDevicesSubmenu = true;
      } else {
        const parentMenuItem = submenu.closest('.p-menuitem');
        if (parentMenuItem) {
          const labelElement = parentMenuItem.querySelector('.p-menuitem-text');
          if (labelElement && labelElement.textContent?.trim() === 'Devices') {
            isDevicesSubmenu = true;
          }
        }
        // Also check if it's next to the Devices parent menu item
        if (!isDevicesSubmenu) {
          const devicesParent = menuElement.querySelector('.p-menu-submenu-label.devices-menu-item');
          if (devicesParent && (devicesParent.nextElementSibling === submenu || submenu.contains(devicesParent))) {
            isDevicesSubmenu = true;
          }
        }
      }
      
      if (isDevicesSubmenu) {
        // Always check our state - if it says closed, force it closed
        const shouldBeOpen = this.isDevicesMenuOpen();
        
        if (!shouldBeOpen) {
          // Force hide with all possible methods
          submenu.style.setProperty('display', 'none', 'important');
          submenu.style.setProperty('visibility', 'hidden', 'important');
          submenu.style.setProperty('opacity', '0', 'important');
          submenu.style.setProperty('max-height', '0', 'important');
          submenu.style.setProperty('overflow', 'hidden', 'important');
          submenu.style.setProperty('height', '0', 'important');
          submenu.style.setProperty('padding', '0', 'important');
          submenu.style.setProperty('margin', '0', 'important');
          submenu.style.setProperty('position', 'absolute', 'important');
          submenu.style.setProperty('left', '-9999px', 'important');
          
          // Remove PrimeNG's active class from parent if it exists
          const devicesParent = menuElement.querySelector('.p-menu-submenu-label.devices-menu-item');
          if (devicesParent) {
            devicesParent.classList.remove('p-menuitem-active');
          }
          
          // Also remove from the submenu itself
          submenu.classList.remove('p-submenu-list-active');
        } else {
          // Show it if state says it should be open
          submenu.style.setProperty('display', 'block', 'important');
          submenu.style.setProperty('visibility', 'visible', 'important');
          submenu.style.setProperty('opacity', '1', 'important');
          submenu.style.removeProperty('height');
          submenu.style.removeProperty('position');
          submenu.style.removeProperty('left');
        }
      }
    });
  }
  
  private updateDevicesSubmenuVisibility(): void {
    // Always use the force hide method which searches for the element
    this.forceHideDevicesSubmenu();
    
    // Then show it if needed
    if (this.isDevicesMenuOpen() && this.devicesSubmenuElement) {
      this.devicesSubmenuElement.style.setProperty('display', 'block', 'important');
      this.devicesSubmenuElement.style.setProperty('visibility', 'visible', 'important');
      this.devicesSubmenuElement.style.setProperty('opacity', '1', 'important');
      this.devicesSubmenuElement.style.setProperty('max-height', '1000px', 'important');
      this.devicesSubmenuElement.style.setProperty('overflow', 'visible', 'important');
      this.devicesSubmenuElement.style.removeProperty('height');
      this.devicesSubmenuElement.style.removeProperty('padding');
      this.devicesSubmenuElement.style.removeProperty('margin');
    }
  }
  
  private removeDevicesMenuHoverListeners(): void {
    if (this.hoverListeners) {
      this.hoverListeners.element.removeEventListener('mouseenter', this.hoverListeners.enter);
      this.hoverListeners.element.removeEventListener('mouseleave', this.hoverListeners.leave);
      
      // Also remove submenu listeners if they exist
      const listeners = this.hoverListeners as any;
      if (listeners.submenuElement && listeners.submenuEnter && listeners.submenuLeave) {
        listeners.submenuElement.removeEventListener('mouseenter', listeners.submenuEnter);
        listeners.submenuElement.removeEventListener('mouseleave', listeners.submenuLeave);
      }
      
      this.hoverListeners = null;
    }
  }

  menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [];
    
    // Dashboard
    if (this.permissionService.hasPermission('View Sites')) {
      items.push({
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard',
        command: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    }

    // Devices (with submenu)
    if (this.permissionService.hasPermission('View Devices')) {
      const deviceChildren: MenuItem[] = [];
      
      if (this.permissionService.hasPermission('View Zones')) {
        deviceChildren.push({
          label: 'Zones',
          icon: 'pi pi-map-marker',
          command: () => {
            this.router.navigate(['/zones']);
          }
        });
      }
      if (this.permissionService.hasPermission('View Sites')) {
        deviceChildren.push({
          label: 'Sites',
          icon: 'pi pi-building',
          command: () => {
            this.router.navigate(['/sites']);
          }
        });
      }
      if (this.permissionService.hasPermission('View Devices')) {
        deviceChildren.push({
          label: 'Devices',
          icon: 'pi pi-desktop',
          command: () => {
            this.router.navigate(['/devices']);
          }
        });
      }
      if (this.permissionService.hasPermission('View Sensors')) {
        deviceChildren.push({
          label: 'Sensors',
          icon: 'pi pi-wifi',
          command: () => {
            this.router.navigate(['/sensors']);
          }
        });
      }
      if (this.permissionService.hasPermission('View Readings')) {
        deviceChildren.push({
          label: 'Readings',
          icon: 'pi pi-chart-line',
          command: () => {
            this.router.navigate(['/readings']);
          }
        });
      }

      if (deviceChildren.length > 0) {
        // Always set expanded to false initially - PrimeNG will auto-expand if it detects active routes
        // We'll override this with our state management
        const devicesMenuItem: MenuItem = {
          label: 'Devices',
          icon: 'pi pi-desktop',
          items: deviceChildren,
          expanded: false, // Always start collapsed
          routerLink: '/devices',
          command: () => {
            // Navigate to devices page when clicking the parent Devices menu item
            this.router.navigate(['/devices']);
          }
        };
        items.push(devicesMenuItem);
      }
    }

    // Events
    if (this.permissionService.hasPermission('View Events')) {
      items.push({
        label: 'Events',
        icon: 'pi pi-exclamation-triangle',
        routerLink: '/events',
        command: () => {
          this.router.navigate(['/events']);
        }
      });
    }

    // Maintenance
    if (this.permissionService.hasPermission('View Maintenance')) {
      items.push({
        label: 'Maintenance',
        icon: 'pi pi-wrench',
        routerLink: '/maintenance',
        command: () => {
          this.router.navigate(['/maintenance']);
        }
      });
    }

    // Users menu: SuperAdmin gets submenu (All Users + each tenant); others with View Users get single link to tenant user list
    if (this.permissionService.hasRole('SuperAdministrator')) {
      const tenants = this.tenantList() ?? [];
      const userSubItems: MenuItem[] = [
        { label: 'All Users', icon: 'pi pi-list', routerLink: '/users', command: () => this.router.navigate(['/users']) }
      ];
      tenants.forEach((t: Tenant) => {
        userSubItems.push({
          label: t.name,
          icon: 'pi pi-building',
          routerLink: '/users',
          queryParams: { tenantId: t.id },
          command: () => this.router.navigate(['/users'], { queryParams: { tenantId: t.id } })
        });
      });
      items.push({
        label: 'Users',
        icon: 'pi pi-users',
        items: userSubItems,
        expanded: false,
        routerLink: '/users',
        command: () => this.router.navigate(['/users'])
      });
    } else if (this.permissionService.hasPermission('View Users')) {
      items.push({
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/users',
        command: () => this.router.navigate(['/users'])
      });
    }

    // Notifications
    if (this.permissionService.hasPermission('View Notifications')) {
      items.push({
        label: 'Notifications',
        icon: 'pi pi-bell',
        routerLink: '/notifications',
        command: () => {
          this.router.navigate(['/notifications']);
        }
      });
    }

    // Support (no permission required)
    items.push({
      label: 'Support',
      icon: 'pi pi-question-circle',
      routerLink: '/support',
      command: () => {
        this.router.navigate(['/support']);
      }
    });

    // Admin Settings (with submenu) - Only visible to SuperAdministrator role
    if (this.permissionService.hasRole('SuperAdministrator')) {
      const adminSettingsChildren: MenuItem[] = [];
      
      // EventTypes
      if (this.permissionService.hasPermission('View System Settings')) {
        adminSettingsChildren.push({
          label: 'EventTypes',
          icon: 'pi pi-tag',
          routerLink: '/eventtypes',
          command: () => {
            this.router.navigate(['/eventtypes']);
          }
        });
      }
      
      // RegTypes
      if (this.permissionService.hasPermission('View System Settings')) {
        adminSettingsChildren.push({
          label: 'RegTypes',
          icon: 'pi pi-list',
          routerLink: '/regtypes',
          command: () => {
            this.router.navigate(['/regtypes']);
          }
        });
      }
      
      // Tenants - Always available for SuperAdministrator
      adminSettingsChildren.push({
        label: 'Tenants',
        icon: 'pi pi-briefcase',
        routerLink: '/tenants',
        command: () => {
          this.router.navigate(['/tenants']);
        }
      });

      // Roles - View/Manage permissions per screen
      if (this.permissionService.hasPermission('View Roles')) {
        adminSettingsChildren.push({
          label: 'Roles',
          icon: 'pi pi-shield',
          routerLink: '/roles',
          command: () => {
            this.router.navigate(['/roles']);
          }
        });
      }

      if (adminSettingsChildren.length > 0) {
        items.push({
          label: 'Admin Settings',
          icon: 'pi pi-sliders-h',
          items: adminSettingsChildren,
          expanded: false
        });
      }
    }

    // Settings (no permission required)
    items.push({
      label: 'Settings',
      icon: 'pi pi-cog',
      routerLink: '/settings',
      command: () => {
        this.router.navigate(['/settings']);
      }
    });

    return items;
  });

  isActiveRoute(route: string): boolean {
    if (!route) return false;
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
  
  // Handle mouse enter on Devices menu item or submenu
  onDevicesMenuEnter(): void {
    // Clear any pending close timeout
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = undefined;
    }
    
    this.isDevicesMenuHovered.set(true);
    this.updateDevicesSubmenuVisibility();
    this.cdr.markForCheck();
  }
  
  // Handle mouse leave on Devices menu item or submenu
  onDevicesMenuLeave(): void {
    // Only close if no Devices route is active
    if (!this.isDevicesRouteActive()) {
      // Use a small delay to allow mouse to move from menu item to submenu
      // This prevents the menu from closing when moving between elements
      this.hoverTimeoutId = window.setTimeout(() => {
        // Double-check that we're still not hovering (mouse might have re-entered)
        if (!this.isDevicesRouteActive()) {
          this.isDevicesMenuHovered.set(false);
          this.updateDevicesSubmenuVisibility();
          this.cdr.markForCheck();
        }
        this.hoverTimeoutId = undefined;
      }, 100); // 100ms delay to allow smooth transition
    }
  }
  
  // Re-setup listeners when menu items change (e.g., after permissions update)
  private refreshMenuListeners(): void {
    this.removeDevicesMenuHoverListeners();
    setTimeout(() => {
      this.setupDevicesMenuHoverListeners();
    }, 100);
  }

  toggleCollapse(): void {
    this.sidebarService.toggle();
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
  }
}
