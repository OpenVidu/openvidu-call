import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ContextService } from '../services';

/**
 * Guard that checks for a 'redirectUrl' query parameter in the route.
 * If the 'redirectUrl' parameter is valid, it sets the redirect URL in the context service.
 */
export const redirectUrlGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const contextService = inject(ContextService);
	const redirectUrlParameter = route.queryParams['redirectUrl'];

	if (isUrlValid(redirectUrlParameter)) {
		contextService.setRedirectUrl(redirectUrlParameter);
	}

	return true;
};

const isUrlValid = (url: string) => {
	if (!url) return false;

	try {
		new URL(url);
		return true;
	} catch (error) {
		return false;
	}
};
