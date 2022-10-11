import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.services';
import { CallService } from '../call.service';

@Injectable({
	providedIn: 'root'
})
export class NavigationGuardService implements CanActivate {
	constructor(private router: Router, private callService: CallService, private authService: AuthService) {}

	// Check if user can navigate to the route
	async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		await this.callService.initialize();

		if (this.callService.isPrivateAccess()) {
			await this.authService.loginUsingLocalStorageData();

			if (this.authService.isLogged()) {
				return true;
			}

			this.router.navigate(['/'], { queryParams: { sessionId: state.url } });
			return false;
		}
		return true;
	}
}
