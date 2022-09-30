import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.services';

@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	constructor(private router: Router, private authService: AuthService) {}

	// Check if user can navigate to the route
	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			if (this.authService.hasPrivateAccess()) {
				try {
					await this.authService.login();
					const encodedAuthData = `${window.btoa(`${this.authService.getUsername()}:${this.authService.getPassword()}`)}`;
					localStorage.setItem('callAuthData', `Basic ${encodedAuthData}`);
					return resolve(true);
				} catch (error) {
					this.router.navigate(['/'], { queryParams: { sessionId: state.url } });
					return resolve(false);
				}
			} else {
				return resolve(true);
			}
		});
	}
}
