import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

export const nonEmbeddedGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const router = inject(Router);

	const isRequestFromIframe = window.self !== window.top;

	if (isRequestFromIframe) {
		// Redirect to the unauthorized page if the request is from an iframe
		const queryParams = { reason: 'no-iframe' };
		router.navigate(['unauthorized'], { queryParams });
		return false;
	}

	// Allow access to the requested page
	return true;
};
