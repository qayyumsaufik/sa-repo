import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set loading state', () => {
    service.setLoading(true);
    expect(service.isLoading()).toBeTrue();
    service.setLoading(false);
    expect(service.isLoading()).toBeFalse();
  });

  it('should start and stop loading', () => {
    service.startLoading();
    expect(service.isLoading()).toBeTrue();
    service.stopLoading();
    expect(service.isLoading()).toBeFalse();
  });
});
