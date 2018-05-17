import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OpenViduService {

  constructor(private http: HttpClient) { }

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
      return this.http.post<any>('https://' + location.hostname + ':4443/api/sessions', body, options)
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
      return this.http.post<any>('https://' + location.hostname + ':4443/api/tokens', body, options)
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
