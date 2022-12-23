import * as express from 'express';
import { Request, Response } from 'express';

import { CALL_PRIVATE_ACCESS } from '../config';

export const app = express.Router({
	strict: true
});

app.get('/config', async (req: Request, res: Response) => {
	const response = { isPrivate: CALL_PRIVATE_ACCESS.toUpperCase() === 'ENABLED' };
	return res.status(200).send(response);
});
