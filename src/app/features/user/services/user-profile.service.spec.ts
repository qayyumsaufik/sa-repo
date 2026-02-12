import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserProfileService, UserProfile, UpdateUserProfileRequest } from './user-profile.service';
import { environment } from '../../../../environments/environment';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserProfileService]
    });
    service = TestBed.inject(UserProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user profile', () => {
    const mockProfile: UserProfile = {
      userId: 1,
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      defaultView: 'dashboard',
      roles: ['Admin'],
      permissions: ['View Sites']
    };

    service.getProfile().subscribe(result => {
      expect(result).toEqual(mockProfile);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should update user profile', () => {
    const request: UpdateUserProfileRequest = { defaultView: 'sites' };

    service.updateProfile(request).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(null);
  });
});
