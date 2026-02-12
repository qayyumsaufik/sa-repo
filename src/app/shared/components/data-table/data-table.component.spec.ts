import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';

describe('DataTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DataTableComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
