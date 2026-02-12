import { TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
