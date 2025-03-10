import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantNameFormComponent } from './participant-name-form.component';

describe('ParticipantNameFormComponent', () => {
  let component: ParticipantNameFormComponent;
  let fixture: ComponentFixture<ParticipantNameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantNameFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantNameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
