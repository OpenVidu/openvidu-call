import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { FormControl, Validators } from '@angular/forms';
import { NicknameMatcher } from '../../forms-matchers/nickname';
import { UtilsService } from '../../services/utils/utils.service';
import { LayoutType } from '../../types/layout-type';

enum EnlargeIcon {
	BIG = 'fullscreen',
	NORMAL = 'fullscreen_exit'
}

@Component({
	selector: 'stream-component',
	styleUrls: ['./stream.component.css'],
	templateUrl: './stream.component.html'
})
export class StreamComponent implements OnInit {
	fullscreenIcon: EnlargeIcon = EnlargeIcon.BIG;
	mutedSound: boolean;
	toggleNickname: boolean;
	isFullscreen: boolean;

	nicknameFormControl: FormControl;
	matcher: NicknameMatcher;

	@Input() user: UserModel;
	@Output() nicknameClicked = new EventEmitter<any>();
	@Output() replaceScreenTrackClicked = new EventEmitter<any>();
	@Output() enlargeVideoClicked = new EventEmitter<any>();

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
			this.fullscreenIcon = EnlargeIcon.BIG;
		}
	}

	// Has been mandatory fullscreen Input because of Input user did not fire changing
	// the fullscreen user property in publisherStartSpeaking event in VideoRoom Component
	@Input()
	set fullscreen(fullscreen: boolean) {
		this.checkFullscreenIcon(fullscreen);
	}

	ngOnInit() {
		this.nicknameFormControl = new FormControl(this.user.getNickname(), [Validators.maxLength(25), Validators.required]);
		this.matcher = new NicknameMatcher();
	}

	enlargeVideo(resetAll?) {
		const element = this.utilsSrv.getHTMLElementByClassName(this.streamComponent.element.nativeElement, LayoutType.ROOT_CLASS);
		this.enlargeVideoClicked.emit({ element, connectionId: this.user.getConnectionId() , resetAll });
	}

	toggleSound() {
		this.mutedSound = !this.mutedSound;
	}

	toggleNicknameForm() {
		if (this.user.isLocal()) {
			this.toggleNickname = !this.toggleNickname;
		}
	}

	@ViewChild('nicknameInput')
	set nicknameInputElement(element: ElementRef) {
		setTimeout(() => {
			element?.nativeElement.focus();
		});
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

	private checkFullscreenIcon(fullscreen: boolean) {
		this.fullscreenIcon = fullscreen ? EnlargeIcon.NORMAL : EnlargeIcon.BIG;
	}
}
