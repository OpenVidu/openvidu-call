import { Router } from 'express';
import bodyParser from 'body-parser';
import * as participantCtrl from '../controllers/participant.controller.js';
import { withUserBasicAuth } from '../middlewares/auth.middleware.js';
import { validateRoomRequest } from '../middlewares/request-validators/room-validator.middleware.js';

export const participantsRouter = Router();

participantsRouter.use(bodyParser.urlencoded({ extended: true }));
participantsRouter.use(bodyParser.json());

// Participants Routes
participantsRouter.post('/token', withUserBasicAuth, participantCtrl.generateParticipantToken);


