import { Injectable } from '@angular/core';
import { RoomPreferences } from '@typings-ce';
import { LoggerService } from 'openvidu-components-angular';
import { HttpService } from '../http/http.service';

@Injectable({
	providedIn: 'root'
})
// This service is used to store the global preferences of the application
export class GlobalPreferencesService {
	protected log;
	protected roomPreferences: RoomPreferences | undefined;

	constructor(
		protected loggerService: LoggerService,
		protected httpService: HttpService
	) {
		this.log = this.loggerService.get('OpenVidu Meet - GlobalPreferencesService');
	}
}
