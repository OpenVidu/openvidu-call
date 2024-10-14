import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleNavComponent } from './console-nav.component';

describe('ConsoleNavComponent', () => {
  let component: ConsoleNavComponent;
  let fixture: ComponentFixture<ConsoleNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
