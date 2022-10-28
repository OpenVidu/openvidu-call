import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CallService } from './call.service';
import { RestService } from './rest.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	isLoggedObs: Observable<boolean>;
	private AUTH_DATA_NAME = 'callAuthData';
	private username: string;
	private password: string;
	private logged: BehaviorSubject<boolean> = new BehaviorSubject(false);
	private loginError: boolean = false;

	constructor(private callService: CallService, private restService: RestService) {
		this.isLoggedObs = this.logged.asObservable();
	}

	isLogged() {
		return this.logged.getValue();
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

	async loginUsingLocalStorageData() {
		try {
			const authData = this.getCredentialsFromStorage();
			if (!!authData) {
				const decodedDataArr = window.atob(authData)?.split(':');
				if (decodedDataArr?.length > 0) {
					const username = decodedDataArr[0];
					const password = decodedDataArr[1];
					await this.login(username, password);
				}
			}
		} catch (error) {
			this.loginError = true;
			this.logout();
		}
	}

	async login(username: string, password: string) {
		const encodedAuthData = `${window.btoa(`${username}:${password}`)}`;
		localStorage.setItem(this.AUTH_DATA_NAME, encodedAuthData);
		try {
			await this.restService.login(username, password);
			this.username = username;
			this.password = password;
			this.loginError = false;
			this.logged.next(true);
			console.log('Loggin succeeded', username, password);
		} catch (error) {
			console.error('Error doing login ', error);
			this.loginError = true;
			this.logout();
		}
	}

	logout() {
		this.username = '';
		this.password = '';
		this.logged.next(false);
		this.clearAuthData();
	}

	hadLoginError(): boolean {
		return this.loginError;
	}

	private clearAuthData() {
		localStorage.removeItem(this.AUTH_DATA_NAME);
	}
}
