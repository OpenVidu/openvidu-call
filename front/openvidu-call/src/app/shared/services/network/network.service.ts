import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../logger/logger.service';
import { ILogger } from '../../types/logger-type';
import { OvSettingsModel } from '../../models/ovSettings';
import { LocationStrategy } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class NetworkService {
	// private URL_OV = 'https://' + location.hostname + ':4443';
	// private MY_SECRET = 'MY_SECRET';
	private SETTINGS_FILE_NAME = 'ov-settings.json';

	private ovSettings: OvSettingsModel = new OvSettingsModel();

	private log: ILogger;

	constructor(private http: HttpClient, private loggSrv: LoggerService) {
		this.log = this.loggSrv.get('NetworkService');
	}

	async getToken(sessionId: string, openviduServerUrl: string, openviduSecret: string): Promise<string> {
		if (!!openviduServerUrl && openviduSecret) {
			const _sessionId = await this.createSession(sessionId, openviduServerUrl, openviduSecret);
			return await this.createToken(_sessionId, openviduServerUrl, openviduSecret);
		}
		return (await this.http.post<any>('/call/', {sessionId}).toPromise()).token;
	}

	createSession(sessionId: string, openviduServerUrl: string, openviduSecret: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const body = JSON.stringify({ customSessionId: sessionId });
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
					'Content-Type': 'application/json'
				})
			};
			return this.http
				.post<any>(openviduServerUrl + '/api/sessions', body, options)
				.pipe(
					catchError(error => {
						error.status === 409 ? resolve(sessionId) : reject(error);
						return observableThrowError(error);
					})
				)
				.subscribe(response => {
					resolve(response.id);
				});
		});
	}

	createToken(sessionId: string, openviduServerUrl: string, openviduSecret: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const body = JSON.stringify({ session: sessionId });
			const options = {
				headers: new HttpHeaders({
					Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
					'Content-Type': 'application/json'
				})
			};
			return this.http
				.post<any>(openviduServerUrl + '/api/tokens', body, options)
				.pipe(
					catchError(error => {
						reject(error);
						return observableThrowError(error);
					})
				)
				.subscribe(response => {
					this.log.d(response);
					resolve(response.token);
				});
		});
	}

	getOvSettingsData(): Promise<OvSettingsModel> {
		return new Promise(resolve => {
			this.http.get(this.SETTINGS_FILE_NAME).subscribe(
				(data: any) => {
					this.log.d('FILE', data);
					this.log.d('OvSettings:', data.openviduSettings);
					if (data.openviduSettings) {
						this.ovSettings.set(data.openviduSettings);
					}
					resolve(this.ovSettings);
				},
				error => {
					this.log.w('Credentials file not found ');
					resolve(this.ovSettings);
				}
			);
		});
	}
}
