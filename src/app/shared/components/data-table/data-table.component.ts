import { Component, Input, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading) {
      <div class="loading">Loading...</div>
    } @else if (data.length === 0) {
      <div class="empty-state">{{ emptyMessage }}</div>
    } @else {
      <table class="table">
        <thead>
          <tr>
            @for (column of columns; track column.key) {
              <th>
                {{ column.label }}
              </th>
            }
            @if (showActions) {
              <th>Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (item of data; track trackBy(item)) {
            <tr>
              @for (column of columns; track column.key) {
                <td>
                  @if (customCellTemplate) {
                    <ng-container *ngTemplateOutlet="customCellTemplate; context: { $implicit: item, column: column }"></ng-container>
                  } @else {
                    {{ item[column.key] }}
                  }
                </td>
              }
              @if (showActions && actionsTemplate) {
                <td>
                  <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item }"></ng-container>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent<T = any> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No data available';
  @Input() showActions = false;
  @Input() trackBy: (item: T) => any = (item: any) => item.id;
  @Input() customCellTemplate?: TemplateRef<any>;
  @Input() actionsTemplate?: TemplateRef<any>;
}
