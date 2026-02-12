import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { UserProfileService, UserProfile, UpdateUserProfileRequest } from '../../services/user-profile.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    DividerModule,
    ErrorMessageComponent, 
    LoadingSpinnerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);
  defaultView = signal<string>('Engineering');
  isEditing = signal(false);

  viewOptions = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Operator', value: 'Operator' }
  ];

  private userProfileService = inject(UserProfileService);
  errorService = inject(ErrorService);
  loadingService = inject(LoadingService);
  private destroyRef = inject(DestroyRef);

  // Computed properties
  fullName = computed(() => {
    const p = this.profile();
    return p ? `${p.firstName} ${p.lastName}` : '';
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loadingService.startLoading();
    this.errorService.clearError();

    this.userProfileService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.defaultView.set(profile.defaultView);
          this.isEditing.set(false);
          this.loadingService.stopLoading();
        },
        error: (err) => {
          this.errorService.setErrorFromHttp(err);
          this.loadingService.stopLoading();
        }
      });
  }

  startEdit(): void {
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    const profile = this.profile();
    if (profile) {
      this.defaultView.set(profile.defaultView);
    }
  }

  saveProfile(): void {
    const request: UpdateUserProfileRequest = {
      defaultView: this.defaultView()
    };

    this.loadingService.startLoading();
    this.errorService.clearError();

    this.userProfileService.updateProfile(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadProfile(); // Reload profile after update
        },
        error: (err) => {
          this.errorService.setErrorFromHttp(err);
          this.loadingService.stopLoading();
        }
      });
  }

  clearError = (): void => {
    this.errorService.clearError();
  };
}
