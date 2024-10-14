import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoCardComponent } from './logo-card.component';

describe('LogoCardComponent', () => {
  let component: LogoCardComponent;
  let fixture: ComponentFixture<LogoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
