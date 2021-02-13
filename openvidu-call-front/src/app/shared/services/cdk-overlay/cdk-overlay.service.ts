import { Injectable } from '@angular/core';
import { CdkOverlayContainer } from '../../config/custom-cdk-overlay-container';

@Injectable({
	providedIn: 'root'
})
export class CdkOverlayService {

	constructor(private cdkOverlayModel: CdkOverlayContainer) {}

	setSelector(selector: string) {
		this.cdkOverlayModel.setSelector(selector);
	}
}
