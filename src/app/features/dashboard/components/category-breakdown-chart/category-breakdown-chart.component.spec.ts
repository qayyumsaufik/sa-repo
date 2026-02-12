import { TestBed } from '@angular/core/testing';
import { CategoryBreakdownChartComponent } from './category-breakdown-chart.component';

describe('CategoryBreakdownChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryBreakdownChartComponent]
    }).compileComponents();
  });

  it('should create without initializing chart', () => {
    const fixture = TestBed.createComponent(CategoryBreakdownChartComponent);
    const component = fixture.componentInstance as any;
    spyOn(component, 'createChart');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
