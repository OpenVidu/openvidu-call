import { Injectable } from '@angular/core';
import { RestService } from './rest.service';

@Injectable({
	providedIn: 'root'
})
export class ConfigService {
	private config: { isPrivate: boolean };
	private initialization: Promise<void>;

	constructor(private restService: RestService) {}

	async initialize(): Promise<void> {
		if (!this.initialization) {
			this.initialization = this.loadConfig();
		}

		return this.initialization;
	}

	private async loadConfig(): Promise<void> {
		this.config = await this.restService.getConfig();
	}

	isPrivateAccess(): boolean {
		return this.config?.isPrivate ?? true;
	}
}
