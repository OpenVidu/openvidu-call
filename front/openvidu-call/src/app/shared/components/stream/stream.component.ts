import { Component, Input, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { OpenViduLayout } from '../../layout/openvidu-layout';

@Component({
  selector: 'stream-component',
  styleUrls: ['./stream.component.css'],
  templateUrl: './stream.component.html',
})
export class StreamComponent implements OnInit {
  openviduLayout: OpenViduLayout;
  resizeTimeout;
  fullscreenIcon = 'fullscreen';
  mutedSound = false;

  @Input() user: UserModel;

  @ViewChild('videoReference') htmlVideoElement: ElementRef;

  constructor() {}


  ngOnInit() { }

  toggleFullscreen() {
    const document: any = window.document;
    const fs = document.getElementById('container-' + this.user.streamManager.stream.streamId);
    console.log(document.getElementsByTagName('html'));
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
}
