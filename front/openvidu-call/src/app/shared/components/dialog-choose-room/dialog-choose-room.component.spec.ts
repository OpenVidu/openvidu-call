import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChooseRoomComponent } from './dialog-choose-room.component';

describe('DialogChooseRoomComponent', () => {
  let component: DialogChooseRoomComponent;
  let fixture: ComponentFixture<DialogChooseRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogChooseRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogChooseRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
