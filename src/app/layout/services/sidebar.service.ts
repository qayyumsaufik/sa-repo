import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  collapse(): void {
    this.isCollapsed.set(true);
  }

  expand(): void {
    this.isCollapsed.set(false);
  }
}
