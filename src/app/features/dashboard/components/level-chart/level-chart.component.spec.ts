import { TestBed } from '@angular/core/testing';
import { LevelChartComponent } from './level-chart.component';

describe('LevelChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelChartComponent]
    }).compileComponents();
  });

  it('should create without initializing chart', () => {
    const fixture = TestBed.createComponent(LevelChartComponent);
    const component = fixture.componentInstance as any;
    spyOn(component, 'createChart');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
