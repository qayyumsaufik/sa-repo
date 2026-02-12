import { TestBed } from '@angular/core/testing';
import { StateTransitionChartComponent } from './state-transition-chart.component';

describe('StateTransitionChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateTransitionChartComponent]
    }).compileComponents();
  });

  it('should create without initializing chart', () => {
    const fixture = TestBed.createComponent(StateTransitionChartComponent);
    const component = fixture.componentInstance as any;
    spyOn(component, 'createChart');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
