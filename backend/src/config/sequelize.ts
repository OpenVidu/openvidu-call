import { Dialect } from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { DB_DIALECT, DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from '../config.js';
import { GlobalPreferences } from '../models/global-preferences.model.js';
import { LoggerService } from '../services/logger.service.js';


const models = [GlobalPreferences];
const options: SequelizeOptions = {
	database: DB_NAME,
	dialect: DB_DIALECT as Dialect,
	username: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST,
	models
};

const sequelize = new Sequelize(options);
sequelize.addModels(models);


const sequelizeSync = async () => {
	const logger = LoggerService.getInstance();

	try {
		await sequelize.sync();
		logger.verbose('Database connected and models synced.');
	} catch (error) {
		logger.error(`Error connecting to the ${DB_DIALECT} database: ${error}`);
	}
}

export { sequelize, sequelizeSync };
