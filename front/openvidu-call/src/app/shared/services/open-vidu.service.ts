import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OpenViduService {
  URL_OV: string;
  MY_SECRET = 'MY_SECRET';

  constructor(private http: HttpClient) {
    let url_prod = 'https://' + location.hostname;
    const url_dev = 'https://' + location.hostname  + ':4443';
    console.log(environment.production);
    if (location.port) {
      url_prod = url_prod + ':' + location.port;
    }
    this.URL_OV = environment.production ? url_prod : url_dev;
    console.log('url environment', this.URL_OV);
  }

  getToken(mySessionId: string, openviduServerUrl: string = this.URL_OV, openviduSecret: string = this.MY_SECRET): Promise<string> {
    return this.createSession(mySessionId, openviduServerUrl, openviduSecret).then(
      (sessionId: string) => {
        return this.createToken(sessionId, openviduServerUrl, openviduSecret);
      });
  }

  createSession(sessionId: string, openviduServerUrl: string, openviduSecret: string) {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
          'Content-Type': 'application/json',
        })
       };
      return this.http.post<any>(openviduServerUrl + '/api/sessions', body, options)
        .pipe(
          catchError(error => {
            error.status === 409 ? resolve(sessionId) : reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response.id);
        });
    });
  }

  createToken(sessionId: string,  openviduServerUrl: string, openviduSecret: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ session: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
          'Content-Type': 'application/json',
        })
      };
      return this.http.post<any>(openviduServerUrl + '/api/tokens', body, options)
        .pipe(
          catchError(error => {
            reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response.token);
        });
    });
  }
}
