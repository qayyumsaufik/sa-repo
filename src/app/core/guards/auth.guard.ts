import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth0 = inject(AuthService);
  const router = inject(Router);

  return auth0.isAuthenticated$.pipe(
    take(1),
    tap(isAuthenticated => {
      // Redirect to login when not authenticated (treat undefined/falsy as unauthenticated)
      if (!isAuthenticated) {
        const returnUrl = state.url && state.url !== '/' ? state.url : '/dashboard';
        router.navigate(['/login'], {
          queryParams: { returnUrl },
          replaceUrl: true
        });
      }
    }),
    map(isAuthenticated => Boolean(isAuthenticated))
  );
};
