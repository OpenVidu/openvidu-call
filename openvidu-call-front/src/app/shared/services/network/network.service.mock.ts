import { Injectable } from '@angular/core';

@Injectable()
export class NetworkServiceMock {
	constructor() {	}

	async getToken(sessionId: string, openviduServerUrl: string, openviduSecret: string): Promise<string> {
		return 'token';
	}
}
