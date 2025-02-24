import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service.js';
import { LivekitWebhookService } from '../services/livekit-webhook.service.js';
import { RoomService } from '../services/room.service.js';
import { WebhookEvent } from 'livekit-server-sdk';
import { OpenViduWebhookService } from '../services/openvidu-webhook.service.js';
import { container } from '../config/dependency-injector.config.js';

export const lkWebhookHandler = async (req: Request, res: Response) => {
	const logger = container.get(LoggerService);

	try {
		const lkWebhookService = container.get(LivekitWebhookService);
		const roomService = container.get(RoomService);
		const ovWebhookService = container.get(OpenViduWebhookService);

		const webhookEvent: WebhookEvent = await lkWebhookService.getEventFromWebhook(
			req.body,
			req.get('Authorization')!
		);

		const { event: eventType, egressInfo, room, participant } = webhookEvent;

		const roomOrRoomName = getRoomOrRoomName(webhookEvent);
		let isRoomCreatedByMe = false;

		if (roomOrRoomName) {
			isRoomCreatedByMe = roomOrRoomName ? await roomService.isRoomCreatedByOpenViduMeet(roomOrRoomName) : false;
		}

		// Skip webhook events that are not related to OpenVidu Call
		if (roomOrRoomName && !isRoomCreatedByMe) {
			logger.verbose(`Skipping webhook, event is not related to OpenVidu Call: ${eventType}`);
			return res.status(200).send();
		}

		logger.verbose(`Received webhook event: ${eventType}`);

		switch (eventType) {
			case 'egress_started':
			case 'egress_updated':
				await lkWebhookService.handleEgressUpdated(egressInfo!);
				break;
			case 'egress_ended':
				await lkWebhookService.handleEgressEnded(egressInfo!);
				break;
			case 'participant_joined':
				await lkWebhookService.handleParticipantJoined(room!, participant!);
				break;
			case 'room_finished':
				await ovWebhookService.sendRoomFinishedWebhook(room!);
				break;
			default:
				break;
		}
	} catch (error) {
		logger.error(`Error handling webhook event: ${error}`);
	}

	return res.status(200).send();
};

function getRoomOrRoomName(webhookEvent: WebhookEvent) {
	const { room, egressInfo, ingressInfo } = webhookEvent;
	const roomName = room?.name ?? egressInfo?.roomName ?? ingressInfo?.roomName ?? '';

	// !KNOWN issue: room metadata is empty when track_publish and track_unpublish events are received
	// This not affect OpenVidu Call, but it is a limitation of the LiveKit server

	// Prefer webhook room object over roomName if available
	return room ?? roomName;
}
