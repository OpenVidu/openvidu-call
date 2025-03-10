document.getElementById('end-meeting-btn')?.addEventListener('click', () => {
	const meet = document.querySelector('openvidu-meet');
	meet.endMeeting();
});

document.getElementById('leave-room-btn')?.addEventListener('click', () => {
	const meet = document.querySelector('openvidu-meet');
	meet.leaveRoom();
});

document.getElementById('toggle-chat-btn')?.addEventListener('click', () => {
	const meet = document.querySelector('openvidu-meet');
	meet.toggleChat();
});

document.addEventListener('DOMContentLoaded', () => {
	const socket = io();

	// Listen for webhook events from the server
	socket.on('webhookEvent', (payload) => {
		console.log('Webhook event received:', payload);
		addWebhookToLog(payload);
	});

	console.log('DOM loaded');
	const meet = document.querySelector('openvidu-meet');

	// Event listener for when the local participant joined the room
	meet.addEventListener('join', (event) => {
		addEventToLog(event.type, `${JSON.stringify(event.detail)}`);
	});

	// Event listener for when the local participant left the room
	meet.addEventListener('left', (event) => {
		addEventToLog(event.type, `${JSON.stringify(event.detail)}`);
	});
});

function addEventToLog(eventType, eventMessage) {
	const eventsList = document.getElementById('events-list');
	const li = document.createElement('li');
	li.textContent = `[ ${eventType} ] : ${eventMessage}`;
	eventsList.appendChild(li);
}

function addWebhookToLog(payload) {
	const webhookLogList = document.getElementById('webhook-log-list');
	const li = document.createElement('li');
	li.textContent = `[ ${payload.event} ] : ${JSON.stringify(payload)}`;
	webhookLogList.appendChild(li);
}
