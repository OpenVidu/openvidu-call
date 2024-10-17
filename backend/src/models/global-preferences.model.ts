/**
 * This file defines the models for the global preferences of the application.
 *
 * It is used to store the preferences of the application, such as recording enabled, chat enabled, authentication mode, theme, branding, etc.
 */

import { Column, Model, Table } from 'sequelize-typescript';

export interface RoomPreferences {
	recordingEnabled: boolean;
	broadcastingEnabled: boolean;
	chatEnabled: boolean;
}

@Table
export class GlobalPreferences extends Model {
	@Column({ type: 'json' })
	roomPreferences!: RoomPreferences;
}
