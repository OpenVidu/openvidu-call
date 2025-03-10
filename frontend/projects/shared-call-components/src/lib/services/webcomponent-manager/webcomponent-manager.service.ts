import { Injectable } from '@angular/core';

import { ContextService, HttpService, PanelService, PanelType, OpenViduService } from 'shared-call-components';
import {
	OpenViduMeetMessage,
	ParentMessage,
	WebComponentActionType,
	WebComponentEventType
} from 'webcomponent/src/types/message.type';

/**
 * Service to manage the commands from OpenVidu Meet WebComponent/Iframe.
 * This service listens for messages from the iframe and processes them.
 * It also sends messages to the iframe.
 */
@Injectable({
	providedIn: 'root'
})
export class WebComponentManagerService {
	protected isListenerStarted = false;

	constructor(
		protected contextService: ContextService,
		protected panelService: PanelService,
		protected openviduService: OpenViduService,
		protected httpService: HttpService
	) {}

	startCommandsListener(): void {
		if (this.isListenerStarted) return;

		this.isListenerStarted = true;
		// Listen for messages from the iframe
		window.addEventListener('message', async (event) => {
			const message: ParentMessage = event.data;
			const parentDomain = this.contextService.getParentDomain();
			const { action, payload } = message;

			if (!parentDomain) {
				if (action === WebComponentActionType.INITIALIZE) {
					if (!payload || !('domain' in payload)) {
						console.error('Parent domain not provided in message payload');
						return;
					}
					console.debug(`Parent domain set: ${event.origin}`);
					this.contextService.setParentDomain(payload['domain']);
				}
				return;
			}

			if (event.origin !== parentDomain) {
				// console.warn(`Untrusted origin: ${event.origin}`);
				return;
			}

			console.debug('Message received from parent:', event.data);
			// TODO: reject if room is not connected
			switch (action) {
				case WebComponentActionType.END_MEETING:
					// Moderator only
					if (this.contextService.isModeratorParticipant()) {
						const roomName = this.contextService.getRoomName();
						await this.httpService.deleteRoom(roomName);
					}
					break;
				case WebComponentActionType.TOGGLE_CHAT:
					// Toggle chat
					this.panelService.togglePanel(PanelType.CHAT);
					break;
				case WebComponentActionType.LEAVE_ROOM:
					// Leave room.
					await this.openviduService.disconnectRoom();
					break;
				default:
					break;
			}
		});
	}

	stopCommandsListener(): void {
		if (!this.isListenerStarted) return;
		this.isListenerStarted = false;
		window.removeEventListener('message', this.startCommandsListener);
	}

	sendMessageToParent(event: OpenViduMeetMessage /*| RoomDisconnectedEvent*/) {
		if (!this.contextService.isEmbeddedMode()) return;
		console.warn('Sending message to parent :', event);
		const origin = this.contextService.getParentDomain();
		window.parent.postMessage(event, origin);
	}
}
