import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, ChartDataset, registerables, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { EventsChartDataPoint } from '../../../../shared/models/dashboard.model';

Chart.register(...registerables, TimeScale);

type ChartPoint = { x: number | Date; y: number };

@Component({
  selector: 'app-events-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #chartCanvas></canvas>`,
  styles: [`
    canvas {
      max-width: 100%;
      height: 300px;
    }
  `]
})
export class EventsChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: EventsChartDataPoint[] = [];
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart<'bar', ChartPoint[]> | null = null;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const chartData = this.prepareChartData();
    const config: ChartConfiguration<'bar', ChartPoint[]> = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Events Timeline'
          },
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Event Count'
            }
          }
        }
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const chartData = this.prepareChartData();
    this.chart.data = chartData;
    this.chart.update();
  }

  private prepareChartData(): ChartData<'bar', ChartPoint[]> {
    // Group by event type and date
    const eventTypeGroups = new Map<string, { resolved: Array<{ x: Date; y: number }>; unresolved: Array<{ x: Date; y: number }> }>();
    
    this.data.forEach(point => {
      if (!eventTypeGroups.has(point.eventTypeName)) {
        eventTypeGroups.set(point.eventTypeName, { resolved: [], unresolved: [] });
      }
      const group = eventTypeGroups.get(point.eventTypeName)!;
      const date = new Date(point.timeRaised);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (point.resolved) {
        group.resolved.push({ x: dateKey, y: 1 });
      } else {
        group.unresolved.push({ x: dateKey, y: 1 });
      }
    });

    const datasets: ChartDataset<'bar', ChartPoint[]>[] = [];
    let colorIndex = 0;

    eventTypeGroups.forEach((group, eventType) => {
      if (group.unresolved.length > 0) {
        datasets.push({
          label: `${eventType} (Unresolved)`,
          data: this.aggregateByDate(group.unresolved),
          backgroundColor: this.getColor(colorIndex, 0.7),
          borderColor: this.getColor(colorIndex),
          borderWidth: 1
        });
        colorIndex++;
      }
      if (group.resolved.length > 0) {
        datasets.push({
          label: `${eventType} (Resolved)`,
          data: this.aggregateByDate(group.resolved),
          backgroundColor: this.getColor(colorIndex, 0.5),
          borderColor: this.getColor(colorIndex),
          borderWidth: 1
        });
        colorIndex++;
      }
    });

    return {
      datasets
    };
  }

  private aggregateByDate(points: Array<{ x: Date; y: number }>): Array<{ x: Date; y: number }> {
    const aggregated = new Map<string, number>();
    points.forEach(point => {
      const key = point.x.toISOString().split('T')[0];
      aggregated.set(key, (aggregated.get(key) || 0) + point.y);
    });

    return Array.from(aggregated.entries()).map(([dateStr, count]) => ({
      x: new Date(dateStr),
      y: count
    })).sort((a, b) => a.x.getTime() - b.x.getTime());
  }

  private getColor(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,  // Blue
      `rgba(255, 99, 132, ${alpha})`,  // Red
      `rgba(75, 192, 192, ${alpha})`,  // Teal
      `rgba(255, 206, 86, ${alpha})`,  // Yellow
      `rgba(153, 102, 255, ${alpha})`, // Purple
      `rgba(255, 159, 64, ${alpha})`   // Orange
    ];
    return colors[index % colors.length];
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
