import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let auth0: { isAuthenticated$: Observable<boolean> };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    auth0 = {
      isAuthenticated$: of(false)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth0 }
      ]
    });
  });

  it('should redirect to login when unauthenticated', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as any, { url: '/secure' } as any) as Observable<boolean>));
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/secure' },
      replaceUrl: true
    });
  });

  it('should allow navigation when authenticated', async () => {
    auth0.isAuthenticated$ = of(true);

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authGuard({} as any, { url: '/secure' } as any) as Observable<boolean>));
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
