import { Injectable } from '@angular/core';
import { HttpService } from '@services/http.service';

@Injectable({
	providedIn: 'root'
})
export class ConfigService {
	private config: { isPrivate: boolean };
	private initialization: Promise<void>;

	constructor(private restService: HttpService) {}

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
