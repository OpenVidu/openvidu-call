import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { ContextService, HttpService } from '../services';

/**
 * Guard to validate the access to a room.
 */
export const validateRoomAccessGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot
) => {
	const httpService = inject(HttpService);
	const contextService = inject(ContextService);
	const router = inject(Router);

	const { roomName, participantName, secret } = extractParams(route);

	if (contextService.isEmbeddedMode() && !contextService.getParticipantName()) {
		await redirectToUnauthorized(router, 'invalid-participant');
		return false;
	}

	try {
		// Generate a participant token
		const response = await httpService.generateParticipantToken({ roomName, participantName, secret });
		contextService.setToken(response.token);
		return true;
	} catch (error: any) {
		if (error.status === 409) {
			// Participant already exists
			// Redirect to a page where the user can input their participant name
			await router.navigate([`${roomName}/participant-name`], {
				queryParams: { originUrl: _state.url, accessError: 'participant-exists', t: Date.now() },
				skipLocationChange: true
			});
			return false;
		}
		return await redirectToUnauthorized(router, 'invalid-room');
	}
};

const extractParams = (route: ActivatedRouteSnapshot) => ({
	roomName: route.params['room-name'],
	participantName: route.queryParams['participant-name'],
	secret: route.queryParams['secret']
});

const redirectToUnauthorized = async (router: Router, reason: string): Promise<boolean> => {
	await router.navigate(['unauthorized'], { queryParams: { reason } });
	return false;
};
