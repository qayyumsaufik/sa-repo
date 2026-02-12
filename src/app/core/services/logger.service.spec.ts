import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    });
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log when enabled', () => {
    spyOn(console, 'log');
    service.log('Test log');
    expect(console.log).toHaveBeenCalled();
  });

  it('should warn when enabled', () => {
    spyOn(console, 'warn');
    service.warn('Test warn');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should error when enabled', () => {
    spyOn(console, 'error');
    service.error('Test error');
    expect(console.error).toHaveBeenCalled();
  });
});
