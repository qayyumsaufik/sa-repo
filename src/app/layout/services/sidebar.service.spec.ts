import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SidebarService]
    });
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle collapse state', () => {
    expect(service.isCollapsed()).toBeFalse();
    service.toggle();
    expect(service.isCollapsed()).toBeTrue();
    service.toggle();
    expect(service.isCollapsed()).toBeFalse();
  });

  it('should collapse and expand', () => {
    service.collapse();
    expect(service.isCollapsed()).toBeTrue();
    service.expand();
    expect(service.isCollapsed()).toBeFalse();
  });
});
