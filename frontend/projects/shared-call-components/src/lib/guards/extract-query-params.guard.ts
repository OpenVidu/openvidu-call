import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { ContextService } from '../services';

export const extractQueryParamsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const contextService = inject(ContextService);
	const { roomName, participantName, redirectUrl } = extractParams(route);

	if (isValidUrl(redirectUrl)) {
		contextService.setRedirectUrl(redirectUrl);
	}

	contextService.setRoomName(roomName);
	contextService.setParticipantName(participantName);

	return true;
};

const extractParams = (route: ActivatedRouteSnapshot) => ({
	roomName: route.params['room-name'],
	participantName: route.queryParams['participant-name'],
	secret: route.queryParams['secret'],
	redirectUrl: route.queryParams['redirect-url']
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
