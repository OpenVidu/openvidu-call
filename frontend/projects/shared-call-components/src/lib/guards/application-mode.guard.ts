import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { ContextService } from '../services';
import { ApplicationMode } from 'shared-call-components';

export const applicationModeGuard: CanActivateFn = async (
	_route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot
) => {
	const contextService = inject(ContextService);

	const isRequestedFromIframe = window.self !== window.top;

	const applicationMode = isRequestedFromIframe ? ApplicationMode.EMBEDDED : ApplicationMode.STANDALONE;

	contextService.setApplicationMode(applicationMode);

	return true;
};
