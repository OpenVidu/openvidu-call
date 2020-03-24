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
	@Input() canEditNickname: boolean;
	@Output() nicknameClicked = new EventEmitter<any>();
	@Output() replaceScreenTrackClicked = new EventEmitter<any>();
	@Output() enlargeVideoClicked = new EventEmitter<any>();

	@ViewChild('videoReference') htmlVideoElement: ElementRef;
	@ViewChild('nicknameInput') nicknameInput: ElementRef;

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

	enlargeVideo() {
		this.fullscreenIcon = this.fullscreenIcon === EnlargeIcon.BIG ? EnlargeIcon.NORMAL : EnlargeIcon.BIG;
		this.enlargeVideoClicked.emit(this.streamComponent.element.nativeElement.parentElement.parentElement);
	}

	toggleSound(): void {
		this.mutedSound = !this.mutedSound;
	}

	toggleNicknameForm(): void {
		if (this.canEditNickname) {
			this.toggleNickname = !this.toggleNickname;
			setTimeout(() => {
				if (this.nicknameInput.nativeElement) {
					this.nicknameInput.nativeElement.focus();
				}
			});
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
}
