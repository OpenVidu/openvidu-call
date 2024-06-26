import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from '../config.service';
import { StorageService } from '../storage.service';
import { RestService } from '../rest.service';

@Injectable({
	providedIn: 'root'
})
export class NavigationGuardService {
	constructor(
		private router: Router,
		private callService: ConfigService,
		private storageService: StorageService,
		private restService: RestService
	) {}

	// Check if user can navigate to the route
	async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		await this.callService.initialize();

		if (this.callService.isPrivateAccess()) {
			const userCredentials = this.storageService.getUserCredentials();

			if (!userCredentials) {
				this.router.navigate(['/']);
				return false;
			}

			try {
				await this.restService.userLogin(userCredentials);
				return true;
			} catch (error) {
				this.router.navigate(['/'], { queryParams: { roomName: state.url } });
				return false;
			}
		}

		return true;
	}
}
