import { Component, Input, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, ToastModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast></p-toast>
  `,
  styles: []
})
export class ErrorMessageComponent {
  @Input() onDismiss?: () => void;
  private errorService = inject(ErrorService);
  private messageService = inject(MessageService);

  constructor() {
    // Watch for error changes and show toast
    effect(() => {
      const error = this.errorService.error();
      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
          life: 5000
        });
        // Clear error after showing toast
        if (this.onDismiss) {
          this.onDismiss();
        } else {
          this.errorService.clearError();
        }
      }
    });
  }
}
