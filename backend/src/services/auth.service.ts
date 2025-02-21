import {
	MEET_ADMIN_SECRET,
	MEET_ADMIN_USER,
	MEET_PRIVATE_ACCESS,
	MEET_SECRET,
	MEET_USER,
	LIVEKIT_API_KEY,
	LIVEKIT_API_SECRET
} from '../environment.js';
import { AccessToken, AccessTokenOptions, TokenVerifier } from 'livekit-server-sdk';
import { injectable } from '../config/dependency-injector.config.js';

@injectable()
export class AuthService {
	constructor() {}

	generateAdminToken() {
		const options: AccessTokenOptions = {
			ttl: '1h',
			metadata: JSON.stringify({
				role: 'admin'
			})
		};
		const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, options);
		return at.toJwt();
	}

	async verifyToken(token: string) {
		const verifyer = new TokenVerifier(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
		return await verifyer.verify(token);
	}

	authenticateUser(username: string, password: string): boolean {
		if (MEET_PRIVATE_ACCESS === 'true') {
			return username === MEET_USER && password === MEET_SECRET;
		}

		return true;
	}

	// TODO: use hash and salt for password storage
	authenticateAdmin(username: string, password: string): boolean {
		return username === MEET_ADMIN_USER && password === MEET_ADMIN_SECRET;
	}

	validateCredentials(username: string, password: string): string[] {
		const errors: string[] = [];

		if (!username || username.length < 4) {
			errors.push('Username must be at least 4 characters long.');
		}

		if (!password || password.length < 4) {
			errors.push('Password must be at least 4 characters long.');
		}

		return errors;
	}
}
