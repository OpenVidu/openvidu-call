import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenViduLayout } from '../../layout/openvidu-layout';
import {FormControl, FormGroupDirective, Validators} from '@angular/forms';
import { NicknameMatcher } from '../../forms-matchers/nickname';

@Component({
  selector: 'stream-component',
  styleUrls: ['./stream.component.css'],
  templateUrl: './stream.component.html',
})

export class StreamComponent implements OnInit {
  openviduLayout: OpenViduLayout;
  fullscreenIcon = 'fullscreen';
  mutedSound: boolean;
  editNickname: boolean;

  nicknameFormControl = new FormControl('', [Validators.maxLength(25), Validators.required]);
  matcher =  new NicknameMatcher();

  @Input() user: UserModel;
  @Output() nicknameClicked = new EventEmitter<any>();

  @ViewChild('videoReference') htmlVideoElement: ElementRef;

  constructor() {}

  ngOnInit() { }

  toggleFullscreen() {
    const document: any = window.document;
    const fs = document.getElementById('container-' + this.user.streamManager.stream.streamId);
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      console.log('enter FULLSCREEN!');
      this.fullscreenIcon = 'fullscreen_exit';
      if (fs.requestFullscreen) {
        fs.requestFullscreen();
      } else if (fs.msRequestFullscreen) {
        fs.msRequestFullscreen();
      } else if (fs.mozRequestFullScreen) {
        fs.mozRequestFullScreen();
      } else if (fs.webkitRequestFullscreen) {
        fs.webkitRequestFullscreen();
      }
    } else {
      console.log('exit FULLSCREEN!');
      this.fullscreenIcon = 'fullscreen';
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
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
}
