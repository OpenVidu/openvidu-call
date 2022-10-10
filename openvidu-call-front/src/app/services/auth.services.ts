import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RestService } from './rest.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	isLoggedObs: Observable<boolean>;
	private AUTH_DATA_NAME = 'callAuthData';
	private username: string;
	private password: string;
	private privateAccess: boolean = true;
	private isLogged: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor(private restService: RestService) {
		this.isLoggedObs = this.isLogged.asObservable();
	}

	async initialize() {
		const config = await this.restService.getConfig();
		this.privateAccess = config.isPrivate;
		if (this.privateAccess) {
			const authData = this.getCredentialsFromStorage();
			if (!!authData) {
				const decodedDataArr = window.atob(authData)?.split(':');
				if (decodedDataArr.length > 0) {
					const username = decodedDataArr[0];
					const password = decodedDataArr[1];
					try {
						await this.login(username, password);
					} catch (error) {
						console.error(error);
					}
				}
			}
		}
	}

	hasPrivateAccess() {
		return this.privateAccess;
	}

	isUserLogged() {
		return this.isLogged.getValue();
	}

	getUsername(): any {
		return this.username;
	}
	getPassword(): any {
		return this.password;
	}

	getCredentialsFromStorage() {
		return localStorage.getItem(this.AUTH_DATA_NAME);
	}

	async login(username: string, password: string) {
		const encodedAuthData = `${window.btoa(`${username}:${password}`)}`;
		localStorage.setItem(this.AUTH_DATA_NAME, encodedAuthData);
		try {
			await this.restService.login(username, password);
			this.username = username;
			this.password = password;
			this.isLogged.next(true);
			console.log('Loggin succeeded');
		} catch (error) {
			console.error('Error doing login ', error);
			this.isLogged.next(false);
			this.clearAuthData();
			throw error;
		}
	}

	logout() {
		this.username = '';
		this.password = '';
		this.isLogged.next(false);
		this.clearAuthData();
	}

	private clearAuthData() {
		localStorage.removeItem(this.AUTH_DATA_NAME);
	}
}
