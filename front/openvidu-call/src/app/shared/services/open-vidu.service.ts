import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OvSettings } from '../models/ov-settings';

@Injectable({
  providedIn: 'root',
})
export class OpenViduService {
  private URL_OV = 'https://' + location.hostname + ':4443';
  private MY_SECRET = 'MY_SECRET';
  private SETTINGS_FILE_NAME = 'ov-settings.json';

  private ovSettings: OvSettings = {
    chat: true,
    autopublish: false,
    toolbarButtons: {
      video: true,
      audio: true,
      fullscreen: true,
      screenShare: true,
      exit: true,
    },
  };

  constructor(private http: HttpClient) {}

  getToken(mySessionId: string, openviduServerUrl: string, openviduSecret: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ov_url = openviduServerUrl !== undefined ? openviduServerUrl : this.URL_OV;
      const ov_secret = openviduSecret !== undefined ? openviduSecret : this.MY_SECRET;
      this.createSession(mySessionId, ov_url, ov_secret)
        .then((sessionId: string) => {
          this.createToken(sessionId, ov_url, ov_secret)
            .then((token) => resolve(token))
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }

  createSession(sessionId: string, openviduServerUrl: string, openviduSecret: string) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
          'Content-Type': 'application/json',
        }),
      };
      return this.http
        .post<any>(openviduServerUrl + '/api/sessions', body, options)
        .pipe(
          catchError((error) => {
            error.status === 409 ? resolve(sessionId) : reject(error);
            return observableThrowError(error);
          }),
        )
        .subscribe((response) => {
          console.log(response);
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
          'Content-Type': 'application/json',
        }),
      };
      return this.http
        .post<any>(openviduServerUrl + '/api/tokens', body, options)
        .pipe(
          catchError((error) => {
            reject(error);
            return observableThrowError(error);
          }),
        )
        .subscribe((response) => {
          console.log(response);
          resolve(response.token);
        });
    });
  }

  getOvSettingsData(): Promise<OvSettings> {
    return new Promise((resolve) => {
      this.http.get(this.SETTINGS_FILE_NAME).subscribe(
        (data: any) => {
          console.log('FILE', data);
          console.log(data.openviduSettings);
          this.ovSettings = data.openviduSettings ? data.openviduSettings : this.ovSettings;
          if (data.openviduCredentials) {
            this.URL_OV = data.openviduCredentials.openvidu_url ? data.openviduCredentials.openvidu_url : this.URL_OV;
            this.MY_SECRET = data.openviduCredentials.openvidu_secret ? data.openviduCredentials.openvidu_secret : this.MY_SECRET;
          }
          console.log('URL Environment', this.URL_OV);
          resolve(data.openviduSettings);
        },
        (error) => {
          console.warn('Credentials file not found ');
          if (environment.openvidu_url) {
            console.warn('Getting from environment ');
            this.URL_OV = environment.openvidu_url;
            this.MY_SECRET = environment.openvidu_secret;
          }
          console.log('URL Environment', this.URL_OV);
          resolve(this.ovSettings);
        },
      );
    });
  }
}
