import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  defaultView: string;
  roles: string[];
  permissions: string[];
}

export interface UpdateUserProfileRequest {
  defaultView: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiService = inject(ApiService);

  getProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('user/profile');
  }

  updateProfile(request: UpdateUserProfileRequest): Observable<void> {
    return this.apiService.put<void>('user/profile', request);
  }
}
