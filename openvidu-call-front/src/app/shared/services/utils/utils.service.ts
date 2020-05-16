import { Injectable } from '@angular/core';
import { OpenViduLayoutOptions } from '../../layout/openvidu-layout';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogErrorComponent } from '../../components/dialog-error/dialog-error.component';
import { LayoutBigElement } from '../../types/layout-type';

@Injectable({
	providedIn: 'root'
})
export class UtilsService {

	private dialogRef: MatDialogRef<DialogErrorComponent, any>;

	constructor(public dialog: MatDialog) {}

	toggleFullscreen(elementId: string) {
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
		}
	}

	getOpenViduAvatar(): string {
		return 'https://openvidu.io/img/logos/openvidu_globe_bg_transp_cropped.png';
	}

	handlerScreenShareError(error: any) {
		if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
			alert('Your browser does not support screen sharing');
		} else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
			alert('You need to enable screen sharing extension');
		} else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
			// alert('You need to choose a window or application to share');
		}
	}

	getOpenviduLayoutOptions(): OpenViduLayoutOptions {
		const options = {
			maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
			minRatio: 9 / 15, // The widest ratio that will be used (default 16x9)
			fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
			bigClass: LayoutBigElement.BIG_ELEMENT_CLASS, // The class to add to elements that should be sized bigger
			bigPercentage: 0.85, // The maximum percentage of space the big ones should take up
			bigFixedRatio: false, // fixedRatio for the big ones
			bigMaxRatio: 3 / 2, // The narrowest ratio to use for the big elements (default 2x3)
			bigMinRatio: 9 / 16, // The widest ratio to use for the big elements (default 16x9)
			bigFirst: true, // Whether to place the big one in the top left (true) or bottom right
			animate: true // Whether you want to animate the transitions
		};
		return options;
	}

	generateNickname(): string {
		return 'OpenVidu_User' + Math.floor(Math.random() * 100);
	}

	isFF(): boolean {
		return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
	}

	isMobile(): boolean {
		return this.isAndroid() || this.isIos();
	}

	showErrorMessage(header: string, message: string, disableClose: boolean = false) {
		this.dialogRef = this.dialog.open(DialogErrorComponent, {
			data: { header: header, message: message },
			disableClose
		});
	}

	closeDialog() {
		this.dialogRef.close();
	}

	getHTMLElementByClassName(element: HTMLElement, className: string): HTMLElement {
		while (!!element && element !== document.body) {
			if (element.className.includes(className)) {
				return element;
			}
			element = element.parentElement;
		}
		return null;
	}

	toggleBigElementClass(element: HTMLElement | Element) {
		if (element?.className.includes(LayoutBigElement.BIG_ELEMENT_CLASS)) {
			element?.classList.remove(LayoutBigElement.BIG_ELEMENT_CLASS);
		} else {
			element.classList.add(LayoutBigElement.BIG_ELEMENT_CLASS);
		}
	}

	removeAllBigElementClass() {
		const elements: HTMLCollectionOf<Element> = document.getElementsByClassName(LayoutBigElement.BIG_ELEMENT_CLASS);
		while (elements.length > 0) {
			this.toggleBigElementClass(elements[0]);
		}
	}


	private isAndroid(): boolean {
		return /\b(\w*Android\w*)\b/.test(navigator.userAgent) && /\b(\w*Mobile\w*)\b/.test(navigator.userAgent);
	}

	private isIos(): boolean {
		return /\b(\w*iOS\w*)\b/.test(navigator.userAgent);
	}
}
