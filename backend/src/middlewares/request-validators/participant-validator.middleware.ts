import { TokenOptions } from '@typings-ce';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const ParticipantTokenRequestSchema: z.ZodType<TokenOptions> = z.object({
	roomName: z.string().nonempty('Room name is required'),
	participantName: z.string().nonempty('Participant name is required'),
	secret: z.string().nonempty('Secret is required')
});

const DeleteParticipantSchema = z.object({
	roomName: z.string().trim().min(1, 'roomName is required')
});

export const validateParticipantTokenRequest = (req: Request, res: Response, next: NextFunction) => {
	const { success, error, data } = ParticipantTokenRequestSchema.safeParse(req.body);

	if (!success) {
		return rejectRequest(res, error);
	}

	req.body = data;
	next();
};

export const validateParticipantDeletionRequest = (req: Request, res: Response, next: NextFunction) => {
	const { success, error, data } = DeleteParticipantSchema.safeParse(req.query);

	if (!success) {
		return rejectRequest(res, error);
	}

	req.query = data!;

	next();
};

const rejectRequest = (res: Response, error: z.ZodError) => {
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
};
