import { TestBed } from '@angular/core/testing';
import { EventsChartComponent } from './events-chart.component';

describe('EventsChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsChartComponent]
    }).compileComponents();
  });

  it('should create without initializing chart', () => {
    const fixture = TestBed.createComponent(EventsChartComponent);
    const component = fixture.componentInstance as any;
    spyOn(component, 'createChart');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
