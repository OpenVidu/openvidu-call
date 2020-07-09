import { Injectable } from '@angular/core';
import { OpenViduLayoutOptions } from '../../layout/openvidu-layout';
import { LayoutClass } from '../../types/layout-type';

@Injectable()
export class UtilsServiceMock {

	constructor() {}

	toggleFullscreen(elementId: string) {}

	getOpenViduAvatar(): string {
		return 'avatar';
	}

	handlerScreenShareError(error: any) {}

	getOpenviduLayoutOptions(): OpenViduLayoutOptions {
		const options = {
			maxRatio: 3 / 2, // The narrowest ratio that will be used (default 2x3)
			minRatio: 9 / 15, // The widest ratio that will be used (default 16x9)
			fixedRatio: false /* If this is true then the aspect ratio of the video is maintained
      and minRatio and maxRatio are ignored (default false) */,
			bigClass: LayoutClass.BIG_ELEMENT, // The class to add to elements that should be sized bigger
			smallClass: LayoutClass.SMALL_ELEMENT,
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
		return 'nickname';
	}

	isFF(): boolean {
		return true;
	}

	isMobile(): boolean {
		return false;
	}

	isAndroid(): boolean {
		return true;
	}

	isIos(): boolean {
		return false;
	}

	showErrorMessage(header: string, message: string, disableClose: boolean = false) {}

	closeDialog() {}

	getHTMLElementByClassName(element: HTMLElement, className: string): HTMLElement {
		return null;
	}

	toggleBigElementClass(element: HTMLElement | Element) {}

	removeAllBigElementClass() {}
}
