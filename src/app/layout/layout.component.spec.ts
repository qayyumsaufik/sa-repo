import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LayoutComponent } from './layout.component';
import { AuthService } from '../core/services/auth.service';
import { ConfirmationService } from 'primeng/api';

describe('LayoutComponent', () => {
  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', [], { isAuthenticated$: of(true) });
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        ConfirmationService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
