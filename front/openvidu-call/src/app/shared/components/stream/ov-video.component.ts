import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { StreamManager } from 'openvidu-browser';
import { VideoType } from '../../types/video-type';

@Component({
	selector: 'ov-video',
	template: `
		<video
			#videoElement
			[attr.id]="streamManager && _streamManager.stream ? 'video-' + _streamManager.stream.streamId : 'video-undefined'"
			[muted]="mutedSound"
		></video>
	`,
	styleUrls: ['./stream.component.css']
})
export class OpenViduVideoComponent implements AfterViewInit {
	@ViewChild('videoElement') elementRef: ElementRef;

	@Input() mutedSound: boolean;

	_streamManager: StreamManager;

	ngAfterViewInit() {
		if (this._streamManager) {
			this._streamManager.addVideoElement(this.elementRef.nativeElement);
		}
	}

	@Input()
	set streamManager(streamManager: StreamManager) {
		this._streamManager = streamManager;
		if (!!this.elementRef && this._streamManager) {
			if (this._streamManager.stream.typeOfVideo === VideoType.SCREEN) {
				this.elementRef.nativeElement.style.objectFit = 'contain';
				this.elementRef.nativeElement.style.background = '#878787';
			} else {
				this.elementRef.nativeElement.style.objectFit = 'cover';
			}
			this._streamManager.addVideoElement(this.elementRef.nativeElement);
		}
	}
}
