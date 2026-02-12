import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>SS Dashboard</h1>
        <p>Please log in to continue</p>
        <button class="btn btn-primary" (click)="login()" [disabled]="loading()">
          @if (loading()) {
            Logging in...
          } @else {
            Log In
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      min-width: 300px;
    }
    .login-card h1 {
      margin-bottom: 8px;
      color: #333;
    }
    .login-card p {
      color: #666;
      margin-bottom: 24px;
    }
    .btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loading = signal(false);

  private auth0 = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.auth0.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          // Redirect to returnUrl if provided, otherwise default to dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        }
      });
  }

  login(): void {
    this.loading.set(true);
    // Get returnUrl from query params to redirect after login
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.auth0.loginWithRedirect({
      appState: { target: returnUrl }
    });
  }
}
