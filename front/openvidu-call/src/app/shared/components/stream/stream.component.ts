import { Component, Input, OnInit, HostListener, ElementRef, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { UserModel } from '../../models/user-model';
import { FormControl, Validators } from '@angular/forms';
import { NicknameMatcher } from '../../forms-matchers/nickname';
enum EnlargeIcon  {	BIG = 'view_carousel', NORMAL = 'view_module' }

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

	constructor() {}

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

	ngOnInit() {
		this.nicknameFormControl = new FormControl(this.user.getNickname(), [Validators.maxLength(25), Validators.required]);
		this.matcher = new NicknameMatcher();
	}

	enlargeVideo(resetAll) {
		this.fullscreenIcon = this.fullscreenIcon === EnlargeIcon.BIG ? EnlargeIcon.NORMAL : EnlargeIcon.BIG;
		const element = this.streamComponent.element.nativeElement.parentElement.parentElement;
		this.enlargeVideoClicked.emit({element, resetAll});
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
}
