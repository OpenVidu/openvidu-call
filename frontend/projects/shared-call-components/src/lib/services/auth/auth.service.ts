import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	protected isAuthenticated = false;
	protected hasCheckAuth = false;

	constructor(
		protected httpService: HttpService,
		protected router: Router
	) {}

	async adminLogin(username: string, password: string) {
		try {
			await this.httpService.adminLogin({ username, password });
			this.isAuthenticated = true;
		} catch (error) {
			console.error((error as HttpErrorResponse).error.message);
			throw error;
		}
	}

	adminRefresh(): Observable<{ message: string }> {
		return from(this.httpService.adminRefresh());
	}

	async adminLogout() {
		try {
			await this.httpService.adminLogout();
			this.isAuthenticated = false;
			this.router.navigate(['console/login']);
		} catch (error) {
			console.error((error as HttpErrorResponse).error.message);
		}
	}

	async isAdminAuthenticated(): Promise<boolean> {
		if (!this.hasCheckAuth) {
			try {
				await this.httpService.adminVerify();
				this.isAuthenticated = true;
			} catch (error) {
				this.isAuthenticated = false;
			}
			this.hasCheckAuth = true;
		}
		return this.isAuthenticated;
	}
}
