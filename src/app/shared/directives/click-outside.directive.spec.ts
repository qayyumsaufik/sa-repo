import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `<div clickOutside (clickOutside)="onOutside()"><span class="inside">Inside</span></div>`,
  standalone: true,
  imports: [ClickOutsideDirective]
})
class HostComponent {
  outsideClicks = 0;
  onOutside(): void {
    this.outsideClicks += 1;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should emit when clicking outside', fakeAsync(() => {
    document.dispatchEvent(new MouseEvent('click'));
    tick();
    expect(fixture.componentInstance.outsideClicks).toBe(1);
  }));

  it('should not emit when clicking inside', fakeAsync(() => {
    const inside = fixture.nativeElement.querySelector('.inside') as HTMLElement;
    inside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();
    expect(fixture.componentInstance.outsideClicks).toBe(0);
  }));
});
