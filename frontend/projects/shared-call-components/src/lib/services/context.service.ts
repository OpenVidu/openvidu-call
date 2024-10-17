import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
	providedIn: 'root'
})
/**
 * Service to manage the context of the application, including embedded mode and token management.
 */
export class ContextService {
	/**
	 * Indicates whether the application is in embedded mode.
	 */
	private embeddedMode: boolean;

	/**
	 * Stores the token for the current session.
	 */
	private token: string | null;

	private decodedToken: any;

	/**
	 * Initializes a new instance of the ContextService class.
	 */
	constructor() {}

	/**
	 * Sets the embedded mode of the application.
	 * @param isEmbedded - A boolean indicating whether the application is in embedded mode.
	 */
	setEmbeddedMode(isEmbedded: boolean): void {
		this.embeddedMode = isEmbedded;
	}

	/**
	 * Checks if the application is in embedded mode.
	 * @returns A boolean indicating whether the application is in embedded mode.
	 */
	isEmbeddedMode(): boolean {
		return this.embeddedMode;
	}

	/**
	 * Sets the token for the current session.
	 * @param token - A string representing the token.
	 */
	setToken(token: string): void {
		this.token = token;
		console.log(token);
		this.decodeJWTToken(token);
	}

	/**
	 * Retrieves the token for the current session.
	 * @returns A string representing the token, or null if no token is set.
	 */
	getToken(): string | null {
		return this.token;
	}

	getRoomName(): string {
		return this.decodedToken.room.roomName;
	}

	private decodeJWTToken(token: string) {
		this.decodedToken = jwtDecode(token);
	}
}
