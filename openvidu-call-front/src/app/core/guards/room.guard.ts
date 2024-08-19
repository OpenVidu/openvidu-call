import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { StorageService } from '../services/storage.service';
import { RestService } from '../services/rest.service';
import { CanActivateFn } from '@angular/router';

export const roomGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const configService = inject(ConfigService);
	const storageService = inject(StorageService);
	const restService = inject(RestService);
	const router = inject(Router);

	try {
		await configService.initialize();

		if (configService.isPrivateAccess()) {
			const userCredentials = storageService.getUserCredentials();

			if (!userCredentials) {
				router.navigate(['/']);
				return false;
			}

			await restService.userLogin(userCredentials);
			return true;
		}
	} catch (error) {
		router.navigate(['/'], { queryParams: { roomName: state.url } });
		return false;
	}

	return true;
};
