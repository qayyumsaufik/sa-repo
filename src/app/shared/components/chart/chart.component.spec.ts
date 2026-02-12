import { TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent]
    }).compileComponents();
  });

  it('should create without initializing chart', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const component = fixture.componentInstance as any;
    spyOn(component, 'createChart');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
