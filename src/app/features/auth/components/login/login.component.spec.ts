import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(async () => {
    const auth0 = jasmine.createSpyObj<AuthService>('AuthService', ['loginWithRedirect'], {
      isAuthenticated$: of(false)
    });
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const route = {
      snapshot: { queryParams: {} }
    } as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: auth0 },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
