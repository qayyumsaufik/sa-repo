import { TestBed } from '@angular/core/testing';
import { SupportPageComponent } from './support-page.component';

describe('SupportPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPageComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SupportPageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
