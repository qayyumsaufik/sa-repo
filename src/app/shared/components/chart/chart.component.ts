import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, ChartData, ChartOptions, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #chartCanvas></canvas>`,
  styles: [`
    canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() type: ChartType = 'line';
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() options: ChartOptions = {};
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['type'] || changes['options'])) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data || { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        ...this.options
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart) {
      this.createChart();
      return;
    }

    const config = this.chart.config as ChartConfiguration;
    config.type = this.type;
    this.chart.data = this.data || { labels: [], datasets: [] };
    this.chart.options = {
      responsive: true,
      maintainAspectRatio: true,
      ...this.options
    };
    this.chart.update();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
