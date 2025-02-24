import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { ContextService } from '../services';
import { ApplicationMode } from 'shared-call-components';

export const applicationModeGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => {
	const router = inject(Router);
	const contextService = inject(ContextService);

	const isRequestedFromIframe = window.self !== window.top;

	const applicationMode = isRequestedFromIframe ? ApplicationMode.EMBEDDED : ApplicationMode.STANDALONE;

	contextService.setApplicationMode(applicationMode);

	// Allow access to the requested page
	return true;
};
