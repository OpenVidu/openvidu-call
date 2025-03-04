import { Router } from 'express';
import bodyParser from 'body-parser';
import * as roomCtrl from '../controllers/room.controller.js';
import { withUserBasicAuth, withValidApiKey } from '../middlewares/auth.middleware.js';
import { validateRoomRequest } from '../middlewares/request-validators/room-validator.middleware.js';

export const roomRouter = Router();

roomRouter.use(bodyParser.urlencoded({ extended: true }));
roomRouter.use(bodyParser.json());

// Room Routes
roomRouter.post('/', /*withValidApiKey,*/ validateRoomRequest, roomCtrl.createRoom);
roomRouter.get('/', withUserBasicAuth, roomCtrl.getRooms);
roomRouter.get('/:roomName', withUserBasicAuth, roomCtrl.getRoom);
roomRouter.delete('/:roomName', withUserBasicAuth, roomCtrl.deleteRooms);

// Room preferences
roomRouter.put('/', /*withAdminBasicAuth,*/ roomCtrl.updateRoomPreferences);
