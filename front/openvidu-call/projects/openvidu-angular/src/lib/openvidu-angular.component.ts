import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { VideoRoomComponent } from './video-room/video-room.component';
import { Session } from 'openvidu-browser';
import { UserModel } from './shared/models/user-model';
import { OpenViduLayout, OpenViduLayoutOptions } from './shared/layout/openvidu-layout';
import { OvSettings } from './shared/models/ov-settings';

@Component({
  selector: 'opv-session',
  template: `
    <app-video-room
      #videoRoom
      [theme]="theme"
      [sessionName]="sessionName"
      [user]="user"
      [openviduServerUrl]="openviduServerUrl"
      [openviduSecret]="openviduSecret"
      [token]="token"
      [ovSettings]="ovSettings"
      (leaveSession)="emitLeaveSessionEvent($event)"
      (joinSession)="emitJoinSessionEvent($event)"
      (error)="emitErrorEvent($event)">
    </app-video-room>
  `,
  styles: [],
})
export class OpenviduSessionComponent implements OnInit {
  // webComponent's inputs and outputs
  @Input() ovSettings: OvSettings;
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
  public videoRoom: VideoRoomComponent;

  constructor() {}

  ngOnInit() {}

  emitJoinSessionEvent(event: any): void {
    this.joinSession.emit(event);
    this.videoRoom.checkSizeComponent();
  }

  emitLeaveSessionEvent(event: any): void {
    this.leaveSession.emit(event);
    // this.display = false;
  }

  emitErrorEvent(event): void {
    setTimeout(() => this.error.emit(event), 20);
  }

  getSession(): Session {
    return this.videoRoom.session;
  }

  getLocalUsers(): UserModel[] {
    return this.videoRoom.localUsers;
  }

  getOpenviduLayout(): OpenViduLayout {
    return this.videoRoom.openviduLayout;
  }

  getOpenviduLayoutOptions(): OpenViduLayoutOptions {
    return this.videoRoom.openviduLayoutOptions;
  }
}
