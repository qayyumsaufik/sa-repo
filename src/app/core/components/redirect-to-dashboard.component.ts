import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Minimal component used for the root path ('').
 * Loaded only after authGuard allows; redirects authenticated users to dashboard.
 */
@Component({
  selector: 'app-redirect-to-dashboard',
  standalone: true,
  template: '',
  styles: []
})
export class RedirectToDashboardComponent {
  private router = inject(Router);

  constructor() {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
