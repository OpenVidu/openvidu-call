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

	if (contextService.isEmbeddedMode() && !participantName) {
		return redirectToUnauthorized(router, 'invalid-participant');
	}

	// Authenticate participant in the room
	try {
		contextService.setParticipantName(participantName);
		const response = await httpService.generateParticipantToken({ roomName, participantName, secret });
		contextService.setRoomName(roomName);
		contextService.setToken(response.token);
		return true;
	} catch (error) {
		console.error('Error generating participant token', error);
		return redirectToUnauthorized(router, 'invalid-room');
	}
};

const extractParams = (route: ActivatedRouteSnapshot) => ({
	roomName: route.params['room-name'],
	participantName: route.queryParams['participant-name'],
	secret: route.queryParams['secret']
});

const redirectToUnauthorized = (router: Router, reason: string): boolean => {
	router.navigate(['unauthorized'], { queryParams: { reason } });
	return false;
};
