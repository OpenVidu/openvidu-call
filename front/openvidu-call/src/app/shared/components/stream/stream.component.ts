import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserModel } from '../../models/user-model';
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
  toggleNickname: boolean;
  isFullscreen: boolean;

  nicknameFormControl: FormControl;
  matcher: NicknameMatcher;

  @Input() user: UserModel;
  @Input() localUser: UserModel;
  @Input() lightTheme: boolean;
  @Input() compact: boolean;
  @Input() chatOpened: boolean;
  @Input() newMessagesNum: number;
  @Input() canEditNickname: boolean;
  @Output() nicknameClicked = new EventEmitter<any>();
  @Output() micButtonClicked = new EventEmitter<any>();
  @Output() camButtonClicked = new EventEmitter<any>();
  @Output() screenShareClicked = new EventEmitter<any>();
  @Output() stopScreenSharingClicked = new EventEmitter<any>();
  @Output() exitButtonClicked = new EventEmitter<any>();
  @Output() chatButtonClicked = new EventEmitter<any>();

  @ViewChild('videoReference', {static: false}) htmlVideoElement: ElementRef;
  @ViewChild('nicknameInput', {static: false}) nicknameInput: ElementRef;


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

  ngOnInit() {
    this.nicknameFormControl = new FormControl(this.user.getNickname(), [Validators.maxLength(25), Validators.required]);
    this.matcher = new NicknameMatcher();
  }

  toggleFullscreen() {
    const state = this.apiSrv.toggleFullscreen('container-' + this.user.getStreamManager().stream.streamId);
    if (state === 'fullscreen') {
      this.isFullscreen = true;
      this.fullscreenIcon = 'fullscreen_exit';
      if (this.chatOpened) {
        this.chatButtonClicked.emit();
      }
    } else {
      this.isFullscreen = false;
      this.fullscreenIcon = 'fullscreen';
    }
  }

  toggleSound(): void {
    this.mutedSound = !this.mutedSound;
  }

  toggleNicknameForm(): void {
    if (this.canEditNickname) {
      this.toggleNickname = !this.toggleNickname;
      setTimeout(() => {
        if (this.nicknameInput.nativeElement) {
          this.nicknameInput.nativeElement.focus();
        }
      });
    }
  }

  eventKeyPress(event) {
    if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
      this.nicknameClicked.emit(this.nicknameFormControl.value);
      this.toggleNicknameForm();
    }
  }

  toggleMic() {
    this.micButtonClicked.emit();
  }

  toggleCam() {
    this.camButtonClicked.emit();
  }

  screenShare() {
    this.screenShareClicked.emit();
  }

  stopScreenSharing() {
    this.stopScreenSharingClicked.emit();
  }

  exitSession() {
    this.exitButtonClicked.emit();
  }

  toggleChat() {
    this.toggleFullscreen();
    if (!this.chatOpened) {
      this.chatButtonClicked.emit();
    }
  }
}
