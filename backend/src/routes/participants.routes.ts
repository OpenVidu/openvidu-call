import { Router } from 'express';
import bodyParser from 'body-parser';
import * as participantCtrl from '../controllers/participant.controller.js';
import { validateParticipantTokenRequest } from '../middlewares/request-validators/participant-validator.middleware.js';

export const participantsRouter = Router();

participantsRouter.use(bodyParser.urlencoded({ extended: true }));
participantsRouter.use(bodyParser.json());

// Participants Routes
participantsRouter.post('/token', validateParticipantTokenRequest, participantCtrl.generateParticipantToken);


