import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const RoomRequestOptionsSchema = z.object({
	roomNamePrefix: z.string().nonempty('Room name prefix is required'),
	endDate: z.number().int().positive('End date must be a positive integer').min(Date.now(), 'End date must be in the future')
});

export const validateRoomRequest = (req: Request, res: Response, next: NextFunction) => {
	const result = RoomRequestOptionsSchema.safeParse(req.body);

	if (!result.success) {
		return res.status(400).json({
			name: 'Request validation error',
			message: result.error.errors.map((err) => err.message)[0]
		});
	}

	req.body = result.data;
	next();
};
