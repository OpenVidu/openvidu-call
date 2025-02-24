import { Router } from 'express';
import bodyParser from 'body-parser';
import * as roomCtrl from '../controllers/room.controller.js';
import { withUserBasicAuth } from '../middlewares/auth.middleware.js';
import { validateRoomRequest } from '../middlewares/request-validators/room-validator.middleware.js';

export const roomRouter = Router();

roomRouter.use(bodyParser.urlencoded({ extended: true }));
roomRouter.use(bodyParser.json());

// Room Routes
roomRouter.post('/', /*withUserBasicAuth*/ validateRoomRequest, roomCtrl.createRoom);
roomRouter.get('/', withUserBasicAuth, roomCtrl.getRooms);
roomRouter.get('/:roomId', withUserBasicAuth, roomCtrl.getRoom);
roomRouter.delete('/:roomId', withUserBasicAuth, roomCtrl.deleteRoom);

// Room preferences
