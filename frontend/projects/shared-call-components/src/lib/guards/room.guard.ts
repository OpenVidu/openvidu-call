import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { ContextService, HttpService } from '../services';

/**
 * Guard to ensure that the provided room name is valid.
 */
export const ensureValidRoomGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => {
	const httpService = inject(HttpService);
	const contextService = inject(ContextService);
	const router = inject(Router);

	const queryParams = route.queryParams;
	const roomName = route.params['roomName'];
	const participantName = queryParams['participantName'];

	if (contextService.isEmbeddedMode() && !participantName) {
		const queryParams = { reason: 'invalid-participant' };
		router.navigate(['unauthorized'], { queryParams });
		return false;
	}

	try {
		contextService.setParticipantName(participantName);
		await httpService.getRoom(roomName);
		contextService.setRoomName(roomName);
		return true;
	} catch (error) {
		const queryParams = { reason: 'invalid-room' };
		router.navigate(['unauthorized'], { queryParams });
		return false;
	}
};
