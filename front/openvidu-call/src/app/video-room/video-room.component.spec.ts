import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRoomComponent } from './video-room.component';

describe('VideoRoomComponent', () => {
  let component: VideoRoomComponent;
  let fixture: ComponentFixture<VideoRoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoRoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
