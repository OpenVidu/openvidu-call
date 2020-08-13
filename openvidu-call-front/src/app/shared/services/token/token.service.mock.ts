import { Injectable } from '@angular/core';
import { ExternalConfigModel } from '../../models/external-config';
import { OvSettingsModel } from '../../models/ovSettings';

@Injectable({
	providedIn: 'root'
})
export class TokenServiceMock {

	private webcamToken = '';
	private screenToken = '';
	private sessionId = '';
	private ovSettings: OvSettingsModel;

	constructor() {
	}

	initialize(ovSettings: OvSettingsModel) {
	}

	setSessionId(sessionId: string) {
	}

	getSessionId(): string {
		return '';
	}

	async initTokens(externalConfig: ExternalConfigModel) {

	}

	getWebcamToken(): string {
		return '';
	}

	getScreenToken(): string {
		return '';
	}

	private async generateWebcamToken(sessionId: string, ovUrl: string, ovSecret: string) {
 	}

	private async generateScreenToken(sessionId: string, ovUrl: string, ovSecret: string) {
	}


}
