import { Component, Input, OnInit, HostListener } from '@angular/core';
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

  constructor() {}

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.openviduLayout.updateLayout();
    }, 20);
  }

  ngOnInit() {
    this.openviduLayout = new OpenViduLayout();
    this.openviduLayout.initLayoutContainer(document.getElementById('layout'), {
      maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
      minRatio: 9 / 16, // The widest ratio that will be used (default 16x9)
      fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
      bigClass: 'OV_big', // The class to add to elements that should be sized bigger
      bigPercentage: 0.8, // The maximum percentage of space the big ones should take up
      bigFixedRatio: false, // fixedRatio for the big ones
      bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
      bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
      bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
      animate: true, // Whether you want to animate the transitions
    });
  }

  onVideoPlaying(event) {
    const video: HTMLVideoElement = event.target;
    video.parentElement.parentElement.classList.remove('custom-class');
    this.openviduLayout.updateLayout();
  }

  toggleFullscreen() {
    const document: any = window.document;
    const fs = document.getElementById('container-' + this.user.stream.streamId);
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
