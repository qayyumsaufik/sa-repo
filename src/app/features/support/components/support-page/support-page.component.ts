import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-page">
      <h2>Support</h2>
      <p>Support page - Coming soon</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class SupportPageComponent {}
