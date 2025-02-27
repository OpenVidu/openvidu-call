import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { ContextService } from '../services';
import { ApplicationMode } from '../models';

/**
 * This guard ensures that the route is accessible in the standard mode.
 * It checks whether a valid 'token' query parameter is present in the URL:
 * - If a token is provided, the application mode is set to 'standard with token'.
 * - If no token is provided, the room name is extracted from the URL to set the application mode to 'standard' with the room.
 * Additionally, it redirects users to the 'unauthorized' page if the URL is in an embedded mode (contains 'embedded' in the URL).
 */
export const ensureValidTokenOrRoomNameGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => {
	const contextService = inject(ContextService);
	const router = inject(Router);

	const isEmbeddedMode = state.url.includes('embedded');

	if (isEmbeddedMode) {
		const queryParams = { reason: 'embedded' };
		router.navigate(['unauthorized'], { queryParams });
		return false;
	}

	const queryParams = route.queryParams;
	const tokenParameter = queryParams['token'];

	// if (tokenParameter) {
	// 	// Standard mode with token
	// 	contextService.setApplicationMode(ApplicationMode.STANDALONE_WITH_TOKEN);
	// 	try {
	// 		contextService.setToken(tokenParameter);
	// 	} catch (error) {
	// 		const queryParams = { reason: 'invalid-token' };
	// 		router.navigate(['unauthorized'], { queryParams });
	// 		return false;
	// 	}
	// } else {
		const roomName = route.params['roomName'] || '';

		// Standard mode without token
		// As token is not provided, we need to get the room name from the URL
		if (!roomName) {
			// Redirect to the home page if the room name is not provided
			router.navigate(['/home']);
			return false;
		}

		contextService.setApplicationMode(ApplicationMode.STANDALONE);
		contextService.setRoomName(roomName);
	// }

	return true;
};
