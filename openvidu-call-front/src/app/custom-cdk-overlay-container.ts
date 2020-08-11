import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class CdkOverlayContainer extends OverlayContainer implements OnDestroy{
	containerSelector = '.OT_widget-container';
	customClass = 'cdk-overlay-container';

	constructor(@Inject(DOCUMENT) _document: any) {
		super(_document);
	}


	protected _createContainer(): void {
		const container = document.createElement('div');
		container.classList.add(this.customClass);
		console.log('ASDOFJSODJFSOJDF', this.containerSelector);
		this._containerElement = this.getElement(this.containerSelector).appendChild(container);
	}

	ngOnDestroy() {
		super.ngOnDestroy();
	}

	setSelector(selector: string) {
		// TODO: when screen and camera are available,
		// the menu doesnt show in screen fullscreen due to the class selector is duplicate and is gotten the first one

		// if (this.containerSelector !== selector) {

		// 	this.containerSelector = selector;
		// 	this._createContainer();
		// }

	}

	private getElement(selector: string): Element {
		return document.querySelector(selector);
	}
}
