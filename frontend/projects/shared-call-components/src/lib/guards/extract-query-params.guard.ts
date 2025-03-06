import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { ContextService } from '../services';

export const extractQueryParamsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const contextService = inject(ContextService);
	const { roomName, participantName, leaveRedirectUrl } = extractParams(route);

	if (isValidUrl(leaveRedirectUrl)) {
		contextService.setLeaveRedirectUrl(leaveRedirectUrl);
	}

	contextService.setRoomName(roomName);
	contextService.setParticipantName(participantName);

	return true;
};

const extractParams = (route: ActivatedRouteSnapshot) => ({
	roomName: route.params['room-name'],
	participantName: route.queryParams['participant-name'],
	secret: route.queryParams['secret'],
	leaveRedirectUrl: route.queryParams['leave-redirect-url']
});

const isValidUrl = (url: string) => {
	if (!url) return false;

	try {
		new URL(url);
		return true;
	} catch (error) {
		return false;
	}
};
