import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { RecordingInfo } from 'openvidu-angular';
import { lastValueFrom } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class RestService {
	private APPLICATION_SERVER_URL = 'http://localhost:5000/';

	constructor(private http: HttpClient, private platform: Platform) {
		// WARNING!! To make easier first steps with mobile devices, this code allows
		// using the demos OpenVidu deployment when no custom deployment is provided
		if (this.platform.is('hybrid') && this.APPLICATION_SERVER_URL === 'http://localhost:5000/') {
			/**
			 * WARNING: this APPLICATION_SERVER_URL is not secure and is only meant for a first quick test.
			 * Anyone could access your video sessions. You should modify the APPLICATION_SERVER_URL to a custom private one.
			 */
			this.APPLICATION_SERVER_URL = 'https://demos.openvidu.io/openvidu-call/';

		}
	}

	async getTokensFromBackend(sessionId: string): Promise<{ cameraToken: string; screenToken: string; recordings?: RecordingInfo[] }> {
		try {
			return lastValueFrom(this.http.post<any>(this.APPLICATION_SERVER_URL + 'sessions', { sessionId }));
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	async startRecording(sessionId: string) {
		try {
			return lastValueFrom(this.http.post<any>(this.APPLICATION_SERVER_URL + 'recordings/start', { sessionId }));
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	async stopRecording(sessionId: string) {
		try {
			return lastValueFrom(this.http.post<any>(this.APPLICATION_SERVER_URL + 'recordings/stop', { sessionId }));
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	async login(password: string): Promise<any[]> {
		try {
			return lastValueFrom(
				this.http.post<any>(`${this.APPLICATION_SERVER_URL}admin/login`, {
					password
				})
			);
		} catch (error) {
			console.log(error);
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	async logout(): Promise<void> {
		try {
			return lastValueFrom(
				this.http.post<any>(`${this.APPLICATION_SERVER_URL}admin/logout`, {})
			);
		} catch (error) {
			console.log(error);
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}


	async deleteRecording(id: string): Promise<any[]> {
		try {
			return lastValueFrom(this.http.delete<any>(`${this.APPLICATION_SERVER_URL}recordings/delete/${id}`));
		} catch (error) {
			console.log(error);
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	getRecordings(): Promise<any[]> {
		return lastValueFrom(
			this.http.get<any>(`${this.APPLICATION_SERVER_URL}recordings`)
		);
	}

	getRecording(recordingId: string) {
		try {
			return lastValueFrom(
				this.http.get(`${this.APPLICATION_SERVER_URL}recordings/${recordingId}`, {
					responseType: 'blob'
				})
			);
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}

	getRecording2(recordingId: string) {
		try {
			return lastValueFrom(
				this.http.get(`${this.APPLICATION_SERVER_URL}recordings/${recordingId}`,{
					responseType: 'blob'
				})
			);
		} catch (error) {
			if (error.status === 404) {
				throw { status: error.status, message: 'Cannot connect with backend. ' + error.url + ' not found' };
			}
			throw error;
		}
	}
}
