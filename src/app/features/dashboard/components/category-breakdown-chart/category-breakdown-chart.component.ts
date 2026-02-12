import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { CategoryBreakdown } from '../../../../shared/models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-category-breakdown-chart',
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
export class CategoryBreakdownChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: CategoryBreakdown[] = [];
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

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
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Event Category Breakdown'
          },
          legend: {
            display: true,
            position: 'right'
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

  private prepareChartData(): ChartData<'doughnut'> {
    const labels = this.data.map(d => d.category);
    const counts = this.data.map(d => d.count);
    const backgroundColors = this.data.map((d, index) => this.getColorBySeverity(d.severity, index));

    return {
      labels,
      datasets: [{
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
        borderWidth: 2
      }]
    };
  }

  private getColorBySeverity(severity: string, index: number): string {
    const severityColors: { [key: string]: string } = {
      'Critical': `rgba(220, 53, 69, 0.7)`,  // Red
      'High': `rgba(255, 193, 7, 0.7)`,       // Yellow
      'Medium': `rgba(23, 162, 184, 0.7)`,   // Blue
      'Low': `rgba(40, 167, 69, 0.7)`         // Green
    };

    return severityColors[severity] || this.getColor(index, 0.7);
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
