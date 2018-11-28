import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenViduLayout } from '../../layout/openvidu-layout';
import { FormControl, Validators } from '@angular/forms';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'stream-component',
  styleUrls: ['./stream.component.css'],
  templateUrl: './stream.component.html',
})
export class StreamComponent implements OnInit {
  fullscreenIcon = 'fullscreen';
  mutedSound: boolean;
  editNickname: boolean;
  isFullscreen: boolean;

  nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
  matcher = new NicknameMatcher();

  @Input() user: UserModel;
  @Input() localUser: UserModel;
  @Input() lightTheme: boolean;
  @Input() compact: boolean;
  @Input() newMessagesNum: number;
  @Output() nicknameClicked = new EventEmitter<any>();
  @Output() micButtonClicked = new EventEmitter<any>();
  @Output() camButtonClicked = new EventEmitter<any>();
  @Output() screenShareClicked = new EventEmitter<any>();
  @Output() screenShareDisabledClicked = new EventEmitter<any>();
  @Output() exitButtonClicked = new EventEmitter<any>();
  @Output() chatButtonClicked = new EventEmitter<any>();

  @ViewChild('videoReference') htmlVideoElement: ElementRef;

  constructor(private apiSrv: ApiService) {}

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    const maxHeight = window.screen.height;
    const maxWidth = window.screen.width;
    const curHeight = window.innerHeight;
    const curWidth = window.innerWidth;
    if (maxWidth !== curWidth && maxHeight !== curHeight) {
      this.isFullscreen = false;
      this.fullscreenIcon = 'fullscreen';
    }
  }

  ngOnInit() {}

  toggleFullscreen() {
    const state = this.apiSrv.toggleFullscreen('container-' + this.user.getStreamManager().stream.streamId);
    if (state === 'fullscreen') {
      this.isFullscreen = true;
      this.fullscreenIcon = 'fullscreen_exit';
      this.chatButtonClicked.emit('none');
    } else {
      this.isFullscreen = false;
      this.fullscreenIcon = 'fullscreen';
    }
  }

  toggleSound(): void {
    this.mutedSound = !this.mutedSound;
  }

  toggleNicknameForm(): void {
    if (this.user.isLocal()) {
      this.editNickname = !this.editNickname;
    }
  }

  eventKeyPress(event) {
    if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
      this.nicknameClicked.emit(this.nicknameFormControl.value);
      this.toggleNicknameForm();
      this.nicknameFormControl.reset();
    }
  }

  micStatusChanged() {
    this.micButtonClicked.emit();
  }

  camStatusChanged() {
    this.camButtonClicked.emit();
  }

  screenShare() {
    this.screenShareClicked.emit();
  }

  screenShareDisabled() {
    this.screenShareDisabledClicked.emit();
  }

  exitSession() {
    this.exitButtonClicked.emit();
  }

  toggleChat() {
    this.toggleFullscreen();
    this.chatButtonClicked.emit('block');
  }
}
