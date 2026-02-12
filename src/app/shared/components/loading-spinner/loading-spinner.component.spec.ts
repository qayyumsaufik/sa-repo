import { TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { LoadingService } from '../../../core/services/loading.service';

describe('LoadingSpinnerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
      providers: [LoadingService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoadingSpinnerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
