import { Router } from 'express';
import bodyParser from 'body-parser';
import {
	getRoomPreferences,
	updateRoomPreferences
} from '../controllers/global-preferences/room-preferences.controller.js';
import {
	getAppearancePreferences,
	updateAppearancePreferences
} from '../controllers/global-preferences/appearance-preferences.controller.js';

export const preferencesRouter = Router();

preferencesRouter.use(bodyParser.urlencoded({ extended: true }));
preferencesRouter.use(bodyParser.json());

// Global Preferences Routes
// standaloneRouter.get('/preferences', /*withAdminBasicAuth,*/ getGlobalPreferences);

preferencesRouter.put('/room', /*withAdminBasicAuth,*/ updateRoomPreferences);
preferencesRouter.get('/room', /*withAdminBasicAuth,*/ getRoomPreferences);
preferencesRouter.put('/appearance', /*withAdminAndUserBasicAuth*/ updateAppearancePreferences);
preferencesRouter.get('/appearance', /*withAdminAndUserBasicAuth*/ getAppearancePreferences);
