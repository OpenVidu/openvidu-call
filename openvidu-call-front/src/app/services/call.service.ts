import { Injectable } from '@angular/core';
import { RestService } from './rest.service';

@Injectable({
	providedIn: 'root'
})
export class CallService {
	private privateAccess: boolean = true;
	private initialized: boolean = false;

	constructor(private restService: RestService) {}

	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}
		const config = await this.restService.getConfig();
		this.privateAccess = config.isPrivate;
		this.initialized = true;
	}

	isPrivateAccess(): boolean {
		return this.privateAccess;
	}
}
