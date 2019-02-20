import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { OpenViduLayoutOptions } from '../layout/openvidu-layout';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  BIG_ELEMENT_CLASS = 'OV_big';

  constructor(public http: HttpClient) { }

  toggleFullscreen(elementId: string): string {
    const document: any = window.document;
    const fs = document.getElementById(elementId);
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (fs.requestFullscreen) {
        fs.requestFullscreen();
      } else if (fs.msRequestFullscreen) {
        fs.msRequestFullscreen();
      } else if (fs.mozRequestFullScreen) {
        fs.mozRequestFullScreen();
      } else if (fs.webkitRequestFullscreen) {
        fs.webkitRequestFullscreen();
      }
      return 'fullscreen';

    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return 'fullscreen_exit';
    }
  }

  public getRandomAvatar(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get('https://randomuser.me/api/?lego').subscribe((data: any) => {
        resolve(data.results[0].picture.thumbnail);
      });
    });
  }

  public handlerScreenShareError(error: any) {
    if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
      alert('Your browser does not support screen sharing');
    } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
      alert('You need to enable screen sharing extension');
    } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
       // alert('You need to choose a window or application to share');
    }
  }

  public getOpenviduLayoutOptions(): OpenViduLayoutOptions {
    const options = {
      maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
      minRatio: 9 / 15, // The widest ratio that will be used (default 16x9)
      fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
      bigClass: this.BIG_ELEMENT_CLASS, // The class to add to elements that should be sized bigger
      bigPercentage: 0.85, // The maximum percentage of space the big ones should take up
      bigFixedRatio: false, // fixedRatio for the big ones
      bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
      bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
      bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
      animate: true, // Whether you want to animate the transitions
    };
    return options;
  }
}
