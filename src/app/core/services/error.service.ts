import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private _error = signal<ErrorInfo | null>(null);
  error = this._error.asReadonly();

  setError(message: string, code?: string): void {
    this._error.set({
      message,
      code,
      timestamp: new Date()
    });
  }

  setErrorFromHttp(error: any): void {
    // Handle HttpErrorResponse format
    if (error instanceof HttpErrorResponse) {
      // For 401 errors, show user-friendly message
      if (error.status === 401) {
        this.setError('Your session has expired. Please log in again.', 'AUTHENTICATION_REQUIRED');
        return;
      }
      // For 403 errors, show user-friendly message
      if (error.status === 403) {
        this.setError('You do not have permission to perform this action.', 'ACCESS_DENIED');
        return;
      }
      // Extract message from error response body
      const message = error?.error?.message || error?.message || this.getDefaultErrorMessage(error.status);
      const code = error?.error?.code;
      this.setError(message, code);
      return;
    }
    
    // Handle other error formats
    const message = error?.error?.message || error?.message || 'An unexpected error occurred';
    const code = error?.error?.code;
    this.setError(message, code);
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  hasError(): boolean {
    return this._error() !== null;
  }
}
