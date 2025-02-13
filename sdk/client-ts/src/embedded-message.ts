export class EmbeddedMessageListener {
	allowedOrigin: string;
	callback: Function;
	constructor(allowedOrigin: string, callback: Function) {
		this.allowedOrigin = allowedOrigin;
		this.callback = callback;
		this.initListener();
	}

	private initListener() {
		window.addEventListener('message', (event) => {
			if (event.origin !== this.allowedOrigin) {
				//   console.warn('Unauthorized origin:', event.origin);
				return;
			}

			if (!event || !event.data) return;

			this.handleEvent(event.data);
		});
	}

	private handleEvent(data: any) {
		if (data.type === 'PARTICIPANT_LEFT') {
			this.callback('PARTICIPANT_LEFT', data.message);
		} else if (data.type === 'SESSION_CLOSED') {
			this.callback('SESSION_CLOSED', data.message);
		} else {
			console.log('Evento desconocido:', data);
		}
	}

	setAllowedOrigin(newOrigin: string) {
		this.allowedOrigin = newOrigin;
	}
}
