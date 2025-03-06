import { MEET_ADMIN_SECRET, MEET_ADMIN_USER, MEET_PRIVATE_ACCESS, MEET_SECRET, MEET_USER } from '../environment.js';
import { injectable } from '../config/dependency-injector.config.js';

@injectable()
export class AuthService {
	authenticateAdmin(username: string, password: string): boolean {
		return username === MEET_ADMIN_USER && password === MEET_ADMIN_SECRET;
	}

	authenticateUser(username: string, password: string): boolean {
		if (MEET_PRIVATE_ACCESS === 'true') {
			return username === MEET_USER && password === MEET_SECRET;
		}

		return true;
	}
}
