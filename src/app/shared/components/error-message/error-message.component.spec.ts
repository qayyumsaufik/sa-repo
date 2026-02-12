import { TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';
import { ErrorService } from '../../../core/services/error.service';
import { MessageService } from 'primeng/api';

describe('ErrorMessageComponent', () => {
  beforeEach(async () => {
    const messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
      providers: [
        ErrorService,
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ErrorMessageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
