import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { VideoRoomComponent } from './video-room/video-room.component';

@Component({
  selector: 'opv-session',
  template: `
  <app-video-room #videoRoom [theme]="theme" [sessionName]="sessionName" [user]="user" [openviduServerUrl]="openviduServerUrl"
  [openviduSecret]="openviduSecret" [token]="token" (leaveSession)="emitLeaveSessionEvent($event)"
   (joinSession)="emitJoinSessionEvent($event)" (error)="emitErrorEvent($event)">
</app-video-room>
  `,
  styles: [],
})
export class OpenviduSessionComponent implements OnInit {
  // webComponent's inputs and outputs
  @Input()
  sessionName: string;
  @Input()
  user: string;
  @Input()
  openviduServerUrl: string;
  @Input()
  openviduSecret: string;
  @Input()
  token: string;
  @Input()
  theme: string;
  @Output()
  joinSession = new EventEmitter<any>();
  @Output()
  leaveSession = new EventEmitter<any>();
  @Output()
  error = new EventEmitter<any>();

  @ViewChild('videoRoom')
  videoRoom: VideoRoomComponent;

  constructor() {}

  ngOnInit() {}

  emitJoinSessionEvent(event): void {
    this.joinSession.emit(event);
    this.videoRoom.checkSizeComponent();
  }

  emitLeaveSessionEvent(event): void {
    this.leaveSession.emit(event);
    // this.display = false;
  }

  emitErrorEvent(event): void {
    setTimeout(() => this.error.emit(event), 20);
  }
}
