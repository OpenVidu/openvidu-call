import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ContextService } from '../services';
import { ApplicationMode } from '../models';

/**
 * This guard ensures that the route is only accessible when the application is embedded within an iframe.
 * If the request is not coming from an iframe (e.g., direct access from the browser), the user will be redirected to the 'unauthorized' page.
 * Additionally, it checks if a 'token' query parameter is present in the URL. If not, the user will be redirected to the 'unauthorized' page.
 */
export const embeddedModeGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const contextService = inject(ContextService);
	const router = inject(Router);

	const isRequestFromIframe = window.self !== window.top;

	if (!isRequestFromIframe) {
		// Redirect to the unauthorized page if the request is not from an iframe
		const queryParams = { reason: 'no-iframe' };
		router.navigate(['embedded/unauthorized'], { queryParams });
		return false;
	}

	const isEmbedded = state.url.includes('embedded');

	if (isEmbedded) {
		contextService.setApplicationMode(ApplicationMode.EMBEDDED);

		const tokenParameter = route.queryParams['token'];

		if (!tokenParameter) {
			// Redirect to the unauthorized page if the token is not provided
			const queryParams = { reason: 'no-token' };
			router.navigate(['embedded/unauthorized'], { queryParams });
			return false;
		}

		try {
			contextService.setToken(tokenParameter);
		} catch (error) {
			const queryParams = { reason: 'invalid-token' };
			router.navigate(['embedded/unauthorized'], { queryParams });
			return false;
		}
	}

	// Allow access to the requested page
	return true;
};
