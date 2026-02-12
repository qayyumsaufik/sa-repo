import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="placeholder-page">
      <h2>Settings</h2>
      <p>Settings page - Coming soon</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class SettingsPageComponent {}
