import {
	BroadcastingPreferences,
	ChatPreferences,
	OpenViduMeetRoomOptions,
	RecordingPreferences,
	RoomPreferences,
	VirtualBackgroundPreferences
} from '@typings-ce';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const RecordingPreferencesSchema: z.ZodType<RecordingPreferences> = z.object({
	enabled: z.boolean()
});

const BroadcastingPreferencesSchema: z.ZodType<BroadcastingPreferences> = z.object({
	enabled: z.boolean()
});

const ChatPreferencesSchema: z.ZodType<ChatPreferences> = z.object({
	enabled: z.boolean()
});

const VirtualBackgroundPreferencesSchema: z.ZodType<VirtualBackgroundPreferences> = z.object({
	enabled: z.boolean()
});

const RoomPreferencesSchema: z.ZodType<RoomPreferences> = z.object({
	recordingPreferences: RecordingPreferencesSchema,
	broadcastingPreferences: BroadcastingPreferencesSchema,
	chatPreferences: ChatPreferencesSchema,
	virtualBackgroundPreferences: VirtualBackgroundPreferencesSchema
});

const RoomRequestOptionsSchema: z.ZodType<OpenViduMeetRoomOptions> = z.object({
	expirationDate: z
		.number()
		.positive('Expiration date must be a positive integer')
		.min(Date.now(), 'Expiration date must be in the future'),
	roomNamePrefix: z.string().optional().default(''),
	preferences: RoomPreferencesSchema.optional().default({
		recordingPreferences: { enabled: true },
		broadcastingPreferences: { enabled: true },
		chatPreferences: { enabled: true },
		virtualBackgroundPreferences: { enabled: true }
	}),
	maxParticipants: z
		.number()
		.positive('Max participants must be a positive integer')
		.nullable()
		.optional()
		.default(null)
});

export const validateRoomRequest = (req: Request, res: Response, next: NextFunction) => {
	const { success, error, data } = RoomRequestOptionsSchema.safeParse(req.body);

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
