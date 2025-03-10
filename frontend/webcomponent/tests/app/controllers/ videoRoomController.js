
export const joinRoom = async (req, res) => {
	try {
		const { participantRole, roomUrl } = req.body;

		if (!roomUrl) {
			throw new Error('Room URL is required.');
		}

		res.render('videoRoom', {
			roomUrl,
			participantRole,
			isModerator: participantRole === 'moderator',
		});
	} catch (error) {
		console.error('Error joining room:', error);
		res
			.status(400)
			.json({ message: 'Error joining room', error: error.message });
	}
};

export const handleWebhook = async (req, res, io) => {
	try {

		// Log event
		console.log(`Webhook received:`,  req.body);
		io.emit('webhookEvent', req.body);

		res.status(200).send('Webhook received');

	} catch (error) {
		console.error('Error handling webhook:', error);
		res
			.status(400)
			.json({ message: 'Error handling webhook', error: error.message });
	}
}
