import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomConfigComponent } from './room-config.component';

describe('RoomConfigComponent', () => {
  let component: RoomConfigComponent;
  let fixture: ComponentFixture<RoomConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
