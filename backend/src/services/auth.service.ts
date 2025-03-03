import {
	MEET_ADMIN_SECRET,
	MEET_ADMIN_USER,
	MEET_PRIVATE_ACCESS,
	MEET_SECRET,
	MEET_USER,
	MEET_NAME_ID,
	MEET_ACCESS_TOKEN_EXPIRATION,
	MEET_REFRESH_TOKEN_EXPIRATION,
	MEET_API_BASE_PATH_V1
} from '../environment.js';
import { inject, injectable } from '../config/dependency-injector.config.js';
import { LoggerService } from './logger.service.js';
import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import { CookieOptions } from 'express';

const JWT_SECRET =
	'd23f327216e77cb92a84157a5f360b71df3a1c4af48e313864bb4af97ce8c889c1bf71a6f9717fc59d21e2126f8f61ea4de7c4a88d395b566b8930ee30c836f74379ecd79990a21e20245eb06308f3c3de30106308e7f65806e3c2e46d235681b0a7d12a4dde210d0bb69cc9b4c315f87e883dc81d2fd76cc65affa447039a7ac3ff5659c88261cdbac9f03ec66de3375a486382f5fbc6cc222eb68dd31e9c38570b2d18d52ee2ab7d830fa12c2c8c085181b76d6653fadd463a7a94c083fa478f61829e442b7b34313f6bc7aa5245bcccbfb87702462fac7644f643efb061bb81925dbd5571519b1ac52fb744dc0180d8e5409930168f9f70e7f1ede31cbe81';

@injectable()
export class AuthService {
	constructor(@inject(LoggerService) protected logger: LoggerService) {}

	authenticateUser(username: string, password: string): boolean {
		if (MEET_PRIVATE_ACCESS === 'true') {
			return username === MEET_USER && password === MEET_SECRET;
		}

		return true;
	}

	authenticateAdmin(username: string, password: string): boolean {
		return username === MEET_ADMIN_USER && password === MEET_ADMIN_SECRET;
	}

	generateAccessToken(username: string): string {
		return this.generateJwtToken(username, MEET_ACCESS_TOKEN_EXPIRATION);
	}

	generateRefreshToken(username: string): string {
		return this.generateJwtToken(username, MEET_REFRESH_TOKEN_EXPIRATION);
	}

	private generateJwtToken(username: string, expiration: string): string {
		const token = jwt.sign({}, JWT_SECRET, {
			issuer: MEET_NAME_ID,
			subject: username,
			expiresIn: expiration as StringValue
		});
		return token;
	}

	validateToken(token: string, username?: string): boolean {
		try {
			jwt.verify(token, JWT_SECRET, {
				issuer: MEET_NAME_ID,
				subject: username
			});
			return true;
		} catch (error) {
			this.logger.error('Error validating token: ' + error);
			return false;
		}
	}

	getAccessTokenCookieOptions(): CookieOptions {
		return this.getCookieOptions('/', MEET_ACCESS_TOKEN_EXPIRATION);
	}

	getRefreshTokenCookieOptions(): CookieOptions {
		return this.getCookieOptions(`${MEET_API_BASE_PATH_V1}/auth/admin`, MEET_REFRESH_TOKEN_EXPIRATION);
	}

	private getCookieOptions(path: string, expiration: string): CookieOptions {
		return {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: ms(expiration as StringValue),
			path
		};
	}
}
