import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { FormControl, Validators } from '@angular/forms';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { LayoutType } from '../../types/layout-type';
import { VideoSizeIcon, VideoFullscreenIcon } from '../../types/icon-type';

@Component({
	selector: 'stream-component',
	styleUrls: ['./stream.component.css'],
	templateUrl: './stream.component.html'
})
export class StreamComponent implements OnInit {
	videoSizeIcon: VideoSizeIcon = VideoSizeIcon.BIG;
	fullscreenIcon: VideoFullscreenIcon = VideoFullscreenIcon.BIG;
	mutedSound: boolean;
	toggleNickname: boolean;
	isFullscreen: boolean;

	nicknameFormControl: FormControl;
	matcher: NicknameMatcher;

	_user: UserModel;
	@Output() nicknameClicked = new EventEmitter<any>();
	@Output() replaceScreenTrackClicked = new EventEmitter<any>();
	@Output() toggleVideoSizeClicked = new EventEmitter<any>();

	@ViewChild('streamComponent', { read: ViewContainerRef }) streamComponent: ViewContainerRef;

	constructor(private utilsSrv: UtilsService) {}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		const maxHeight = window.screen.height;
		const maxWidth = window.screen.width;
		const curHeight = window.innerHeight;
		const curWidth = window.innerWidth;
		if (maxWidth !== curWidth && maxHeight !== curHeight) {
			this.isFullscreen = false;
			this.videoSizeIcon = VideoSizeIcon.BIG;
		}
	}

	// Has been mandatory fullscreen Input because of Input user did not fire changing
	// the fullscreen user property in publisherStartSpeaking event in VideoRoom Component
	@Input()
	set videoSizeBig(videoSizeBig: boolean) {
		this.checkVideoSizeBigIcon(videoSizeBig);
	}

	@Input()
	set user(user: UserModel) {
		this._user = user;
		this.nicknameFormControl = new FormControl(this._user.getNickname(), [Validators.maxLength(25), Validators.required]);
	}

	@ViewChild('nicknameInput')
	set nicknameInputElement(element: ElementRef) {
		setTimeout(() => {
			element?.nativeElement.focus();
		});
	}

	ngOnInit() {
		this.matcher = new NicknameMatcher();
	}

	toggleVideoSize(resetAll?) {
		const element = this.utilsSrv.getHTMLElementByClassName(this.streamComponent.element.nativeElement, LayoutType.ROOT_CLASS);
		this.toggleVideoSizeClicked.emit({ element, connectionId: this._user.getConnectionId() , resetAll });
	}

	toggleFullscreen() {
		this.utilsSrv.toggleFullscreen('container-' + this._user.getStreamManager().stream.streamId);
		this.toggleFullscreenIcon();
	  }

	toggleSound() {
		this.mutedSound = !this.mutedSound;
	}

	toggleNicknameForm() {
		if (this._user.isLocal()) {
			this.toggleNickname = !this.toggleNickname;
		}
	}

	eventKeyPress(event) {
		if (event && event.keyCode === 13 && this.nicknameFormControl.valid) {
			this.nicknameClicked.emit(this.nicknameFormControl.value);
			this.toggleNicknameForm();
		}
	}

	replaceScreenTrack() {
		this.replaceScreenTrackClicked.emit();
	}

	private checkVideoSizeBigIcon(videoSizeBig: boolean) {
		this.videoSizeIcon = videoSizeBig ? VideoSizeIcon.NORMAL : VideoSizeIcon.BIG;
	}

	private toggleFullscreenIcon() {
		this.fullscreenIcon = this.fullscreenIcon === VideoFullscreenIcon.BIG ? VideoFullscreenIcon.NORMAL : VideoFullscreenIcon.BIG;
	}
}
