import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { StateTransitionDataPoint } from '../../../../shared/models/dashboard.model';

Chart.register(...registerables, TimeScale);

type ChartPoint = { x: number | Date; y: number };

@Component({
  selector: 'app-state-transition-chart',
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
export class StateTransitionChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: StateTransitionDataPoint[] = [];
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart<'line', ChartPoint[]> | null = null;

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
    const config: ChartConfiguration<'line', ChartPoint[]> = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Site Status Transitions'
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
            type: 'category',
            labels: ['Green', 'Yellow', 'Red'],
            title: {
              display: true,
              text: 'Status'
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

  private prepareChartData(): ChartData<'line', ChartPoint[]> {
    // Group by site
    const siteGroups = new Map<number, { name: string; points: Array<{ x: Date; y: number }> }>();
    
    this.data.forEach(point => {
      if (!siteGroups.has(point.siteId)) {
        siteGroups.set(point.siteId, { name: point.siteName, points: [] });
      }
      const statusValue = point.status === 'Green' ? 0 : point.status === 'Yellow' ? 1 : 2;
      siteGroups.get(point.siteId)!.points.push({
        x: new Date(point.timestamp),
        y: statusValue
      });
    });

    const datasets = Array.from(siteGroups.values()).map((group, index) => ({
      label: group.name,
      data: group.points.sort((a, b) => a.x.getTime() - b.x.getTime()),
      borderColor: this.getColor(index),
      backgroundColor: this.getColor(index, 0.1),
      tension: 0,
      fill: false,
      stepped: 'after' as const
    }));

    return {
      datasets
    };
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
