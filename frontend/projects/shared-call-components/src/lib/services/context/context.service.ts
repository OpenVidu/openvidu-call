import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ApplicationMode, ContextData, Edition } from '../../models/context.model';
import { LoggerService } from 'openvidu-components-angular';
import { ParticipantRole } from 'shared-call-components';

@Injectable({
	providedIn: 'root'
})
/**
 * Service to manage the context of the application, including embedded mode and token management.
 */
export class ContextService {
	private context: ContextData = {
		roomName: '',
		participantName: '',
		token: '',
		participantRole: ParticipantRole.VIEWER,
		participantPermissions: {
			canRecord: false,
			canBroadcast: false,
			canChat: false,
			canChangeVirtualBackground: false,
			canPublishScreen: false
		},
		mode: ApplicationMode.STANDALONE,
		edition: Edition.CE,
		leaveRedirectUrl: '',
		parentDomain: ''
	};

	private log;

	/**
	 * Initializes a new instance of the ContextService class.
	 */
	constructor(private loggerService: LoggerService) {
		this.log = this.loggerService.get('OpenVidu Meet - ContextService');
	}

	/**
	 * Sets the application mode.
	 * @param mode - An ApplicationMode value representing the application mode.
	 */
	setApplicationMode(mode: ApplicationMode): void {
		this.log.d('Setting application mode', mode);
		this.context.mode = mode;
	}

	getParentDomain(): string {
		return this.context.parentDomain;
	}

	setParentDomain(parentDomain: string): void {
		this.context.parentDomain = parentDomain;
	}

	/**
	 * Checks if the application is in embedded mode.
	 * @returns A boolean indicating whether the application is in embedded mode.
	 */
	isEmbeddedMode(): boolean {
		return this.context.mode === ApplicationMode.EMBEDDED;
	}

	isStandaloneMode(): boolean {
		return this.context.mode === ApplicationMode.STANDALONE;
	}

	/**
	 * Sets the token for the current session.
	 * @param token - A string representing the token.
	 */
	setToken(token: string): void {
		try {
			const decodedToken = this.getValidDecodedToken(token);
			this.context.token = token;
			this.context.participantPermissions = decodedToken.metadata.permissions;
			this.context.participantRole = decodedToken.metadata.role;
		} catch (error: any) {
			this.log.e('Error setting token in context', error);
			throw new Error('Error setting token', error);
		}
	}

	getToken(): string {
		return this.context.token;
	}

	setLeaveRedirectUrl(leaveRedirectUrl: string): void {
		this.context.leaveRedirectUrl = leaveRedirectUrl;
	}

	getLeaveRedirectURL(): string {
		return this.context.leaveRedirectUrl;
	}

	getRoomName(): string {
		return this.context.roomName;
	}

	setRoomName(roomName: string): void {
		this.context.roomName = roomName;
	}

	getParticipantName(): string {
		return this.context.participantName;
	}

	getParticipantRole(): ParticipantRole {
		return this.context.participantRole;
	}

	isParticipantViewer(): boolean {
		return this.context.participantRole === ParticipantRole.VIEWER;
	}

	setParticipantName(participantName: string): void {
		this.context.participantName = participantName;
	}

	canRecord(): boolean {
		return this.context.participantPermissions.canRecord;
	}

	canChat(): boolean {
		return this.context.participantPermissions.canChat;
	}

	private getValidDecodedToken(token: string) {
		this.checkIsJWTValid(token);
		const decodedToken: any = jwtDecode(token);
		decodedToken.metadata = JSON.parse(decodedToken.metadata);

		if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
			throw new Error('Token is expired. Please, request a new one');
		}

		return decodedToken;
	}

	private checkIsJWTValid(token: string) {
		if (!token || typeof token !== 'string') {
			throw new Error('Invalid token. Token must be a string');
		}

		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			throw new Error('Invalid token. Token must be a valid JWT');
		}
	}
}
