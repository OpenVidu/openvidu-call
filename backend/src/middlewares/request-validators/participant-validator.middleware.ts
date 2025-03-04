import {
	TokenOptions,
} from '@typings-ce';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const ParticipantTokenRequestSchema: z.ZodType<TokenOptions> = z.object({
	roomName: z.string().nonempty('Room name is required'),
	participantName: z.string().nonempty('Participant name is required'),
	secret: z.string().nonempty('Secret is required')
});

export const validateParticipantTokenRequest = (req: Request, res: Response, next: NextFunction) => {
	const { success, error, data } = ParticipantTokenRequestSchema.safeParse(req.body);

	if (!success) {
		const errors = error.errors.map((error) => ({
			field: error.path.join('.'),
			message: error.message
		}));

		console.log(errors);

		return res.status(422).json({
			error: 'Unprocessable Entity',
			message: 'Invalid request body',
			details: errors
		});
	}

	req.body = data;
	next();
};
