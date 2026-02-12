import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserProfileComponent } from './user-profile.component';
import { UserProfileService } from '../../services/user-profile.service';
import { MessageService } from 'primeng/api';

describe('UserProfileComponent', () => {
  beforeEach(async () => {
    const userProfileService = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['getProfile', 'updateProfile']);
    userProfileService.getProfile.and.returnValue(of({
      userId: 1,
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      defaultView: 'Engineering',
      roles: [],
      permissions: []
    }));
    userProfileService.updateProfile.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: UserProfileService, useValue: userProfileService },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
