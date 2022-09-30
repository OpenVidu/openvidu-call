import { Injectable } from '@angular/core';
import { RestService } from './rest.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private username: string;
	private password: string;

	private privateAccess: boolean = true;

	constructor(private restService: RestService) {}

	async initialize() {
		const config = await this.restService.getConfig();
		this.privateAccess = config.isPrivate;
	}

	hasPrivateAccess() {
		return this.privateAccess;
	}

	getUsername(): any {
		return this.username;
	}
	getPassword(): any {
		return this.password;
	}

	setCredentials(username: any, password: any) {
		this.username = username;
		this.password = password;
	}

	login() {
		return this.restService.login(this.username, this.password);
	}
}
