import { OpenViduMeetMessage } from '../types/message.type';

export class EventsManager {
	private element: HTMLElement;

	constructor(element: HTMLElement) {
		this.element = element;
	}

	public listen() {
		window.addEventListener('message', this.handleMessage.bind(this));
	}

	private handleMessage(event: MessageEvent) {
		const message: OpenViduMeetMessage = event.data;
		// Validate message origin (security measure)
		if (!message || !message.eventType) {
			// console.warn('Invalid message:', message);
			return;
		}

		this.dispatchEvent(message);
	}

	private dispatchEvent(message: OpenViduMeetMessage) {
		const event = new CustomEvent(message.eventType, {
			detail: message.payload,
			bubbles: true,
			composed: true
		});
		this.element.dispatchEvent(event);
	}
}
