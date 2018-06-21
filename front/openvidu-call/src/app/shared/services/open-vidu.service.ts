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

  constructor(private http: HttpClient) { 
    this.URL_OV = environment.production ? 'https://' + location.hostname : 'https://' + location.hostname + ':4443';
    console.log('url environment', this.URL_OV);
  }

  getToken(mySessionId: string): Promise<string> {
    return this.createSession(mySessionId).then(
      sessionId => {
        return this.createToken(sessionId);
      });
  }

  createSession(sessionId) {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:MY_SECRET'),
          'Content-Type': 'application/json',
        })
       };
      return this.http.post<any>(this.URL_OV + '/api/sessions', body, options)
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

  createToken(sessionId): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ session: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:MY_SECRET'),
          'Content-Type': 'application/json',
        })
      };
      return this.http.post<any>(this.URL_OV + '/api/tokens', body, options)
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
