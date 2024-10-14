import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomConfigComponent } from './room-config.component';

describe('RoomConfigComponent', () => {
  let component: RoomConfigComponent;
  let fixture: ComponentFixture<RoomConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
