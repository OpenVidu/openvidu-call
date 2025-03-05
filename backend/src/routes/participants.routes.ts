import { Router } from 'express';
import bodyParser from 'body-parser';
import * as participantCtrl from '../controllers/participant.controller.js';
import {
	validateParticipantDeletionRequest,
	validateParticipantTokenRequest
} from '../middlewares/request-validators/participant-validator.middleware.js';

export const participantsInternalRouter = Router();
participantsInternalRouter.use(bodyParser.urlencoded({ extended: true }));
participantsInternalRouter.use(bodyParser.json());

participantsInternalRouter.post('/token', validateParticipantTokenRequest, participantCtrl.generateParticipantToken);

export const participantsRouter = Router();
participantsRouter.use(bodyParser.urlencoded({ extended: true }));
participantsRouter.use(bodyParser.json());

participantsRouter.delete('/:participantName', validateParticipantDeletionRequest, participantCtrl.deleteParticipant);
