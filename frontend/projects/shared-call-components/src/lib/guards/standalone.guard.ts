import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

/**
 * This guard ensures that the route is only accessible when the application is NOT embedded within an iframe.
 * If the request is coming from an iframe, the user will be redirected to the 'unauthorized' page.
 * This is used to prevent access from embedded contexts (e.g., within a different website or application).
 */
export const standaloneModeGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router = inject(Router);
	const isRequestedFromIframe = window.self !== window.top;

	if (isRequestedFromIframe) {
		// Redirect to the unauthorized page if the request is from an iframe
		const queryParams = { reason: 'no-iframe-allowed' };
		router.navigate(['unauthorized'], { queryParams });
		return false;
	}

	// Allow access to the requested page
	return true;
};
