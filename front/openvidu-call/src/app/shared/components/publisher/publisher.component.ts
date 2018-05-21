import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { Publisher } from 'openvidu-browser';

@Component({
  selector: 'publisher-component',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css'],
})
export class PublisherComponent implements OnInit, DoCheck {

  @Input() publisher: Publisher;

  @Input() isAudioMuted: boolean;

  @Input() isVideoMuted: boolean;


  constructor() {}

  ngOnInit() {
    console.log('PUBLISHER COMPONENT');
  }

  ngDoCheck() {

    if (this.publisher && this.isAudioMuted !== undefined) {
       this.publisher.publishAudio(!this.isAudioMuted);
    }
    if (this.publisher && this.isVideoMuted !== undefined) {
      this.publisher.publishVideo(!this.isVideoMuted);
    }
  }
}
