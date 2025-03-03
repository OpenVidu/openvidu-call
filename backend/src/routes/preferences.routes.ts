import { Router } from 'express';
import bodyParser from 'body-parser';
import {
	getAppearancePreferences,
	updateAppearancePreferences
} from '../controllers/global-preferences/appearance-preferences.controller.js';

export const preferencesRouter = Router();

preferencesRouter.use(bodyParser.urlencoded({ extended: true }));
preferencesRouter.use(bodyParser.json());

preferencesRouter.put('/appearance', /*withAdminAndUserBasicAuth*/ updateAppearancePreferences);
preferencesRouter.get('/appearance', /*withAdminAndUserBasicAuth*/ getAppearancePreferences);
