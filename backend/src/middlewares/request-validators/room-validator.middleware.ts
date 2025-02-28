import {
	BroadcastingPreferences,
	ChatPreferences,
	OpenViduRoomOptions,
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

const RoomRequestOptionsSchema: z.ZodType<OpenViduRoomOptions> = z.object({
	expirationDate: z
		.number()
		.positive('End date must be a positive integer')
		.min(Date.now(), 'End date must be in the future'),
	roomNamePrefix: z.string().optional(),
	preferences: RoomPreferencesSchema.optional(),
	maxParticipants: z.number().positive('Max participants must be a positive integer').optional()
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
