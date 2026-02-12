import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/services/auth.service';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    const authService = jasmine.createSpyObj<AuthService>('AuthService', ['logout'], {
      user$: of({ name: 'Test User', email: 'user@test.com' })
    });
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
