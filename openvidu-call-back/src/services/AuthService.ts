import { NextFunction, Request, Response } from 'express';
const timingSafeEqual = require('crypto').timingSafeEqual;

import { CALL_PRIVATE_ACCESS, CALL_SECRET, CALL_USER } from '../config';

export const authorizer = (req: Request, res: Response, next: NextFunction) => {
	if (CALL_PRIVATE_ACCESS === 'ENABLED') {
		const userAuth = req.headers.authorization;
		const auth = 'Basic ' + Buffer.from(`${CALL_USER}:${CALL_SECRET}`).toString('base64');
		const validAuth = safeCompare(userAuth, auth);

		if (validAuth) {
			next();
		} else {
			console.log('Unauthorized');
			return res.status(401).send('Unauthorized');
		}
	} else {
		next();
	}
};

function safeCompare(userInput: string, secret: string) {
	const userInputLength = Buffer.byteLength(userInput);
	const secretLength = Buffer.byteLength(secret);
	const userInputBuffer = Buffer.alloc(userInputLength, 0, 'utf8');
	userInputBuffer.write(userInput);
	const secretBuffer = Buffer.alloc(userInputLength, 0, 'utf8');
	secretBuffer.write(secret);

	return !!(timingSafeEqual(userInputBuffer, secretBuffer) && userInputLength === secretLength);
}
