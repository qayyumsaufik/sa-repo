import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no error initially', () => {
    expect(service.error()).toBeNull();
    expect(service.hasError()).toBeFalse();
  });

  it('should set error message', () => {
    service.setError('Test error message');
    
    expect(service.error()).not.toBeNull();
    expect(service.error()?.message).toBe('Test error message');
    expect(service.hasError()).toBeTrue();
  });

  it('should set error with code', () => {
    service.setError('Test error', 'ERROR_CODE');
    
    const error = service.error();
    expect(error).not.toBeNull();
    expect(error?.message).toBe('Test error');
    expect(error?.code).toBe('ERROR_CODE');
  });

  it('should clear error', () => {
    service.setError('Test error');
    expect(service.hasError()).toBeTrue();
    
    service.clearError();
    
    expect(service.error()).toBeNull();
    expect(service.hasError()).toBeFalse();
  });

  it('should set error from HTTP error response', () => {
    const httpError = {
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    };
    
    service.setErrorFromHttp(httpError);
    
    const error = service.error();
    expect(error?.message).toBe('Server error');
    expect(error?.code).toBe('SERVER_ERROR');
  });

  it('should handle HTTP error without error object', () => {
    const httpError = {
      message: 'Network error'
    };
    
    service.setErrorFromHttp(httpError);
    
    expect(service.error()?.message).toBe('Network error');
  });

  it('should handle HTTP error with fallback message', () => {
    service.setErrorFromHttp({});
    
    expect(service.error()?.message).toBe('An unexpected error occurred');
  });

  it('should set timestamp when error is set', () => {
    const beforeTime = new Date();
    service.setError('Test error');
    const afterTime = new Date();
    
    const error = service.error();
    expect(error?.timestamp).toBeInstanceOf(Date);
    expect(error?.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(error?.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});
