import { Component, Input, Output, AfterViewInit, DoCheck, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Stream, Publisher, StreamEvent } from 'openvidu-browser';
import { UserModel } from '../../models/user-model';
import { VideoRoomComponent } from '../../../video-room/video-room.component';

@Component({
  selector: 'stream-component',
  styleUrls: ['./stream.component.css'],
  templateUrl: './stream.component.html',
})
export class StreamComponent implements AfterViewInit, DoCheck {
  @ViewChild('videoElement') elementRef: ElementRef;

  videoElement: HTMLVideoElement;

  @Input() user: UserModel;

  @Output() mainVideoStream = new EventEmitter();

  @Input() model: VideoRoomComponent;

  constructor() {}

  ngAfterViewInit() {
    // Get HTMLVideoElement from the view
    this.videoElement = this.elementRef.nativeElement;
  }

  ngDoCheck() {
    // Detect any change in 'stream' property (specifically in its 'srcObject' property)
    if (this.videoElement && this.videoElement.srcObject !== this.user.stream.getMediaStream()) {
      this.videoElement.srcObject = this.user.stream.getMediaStream();
    }
  }


  videoClicked() {
    // Triggers event for the parent component to update its main video display
    this.mainVideoStream.next(this.user.stream);
  }

  changedNickname() {
    if (this.model) {
      this.model.nicknameClicked(this.user.getConnectionId());
    }
  }
}

