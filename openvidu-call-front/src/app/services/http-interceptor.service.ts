import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
	// Intercept all rest request for adding the authorization header
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const authData = localStorage.getItem('callAuthData');
		if (!!authData) {
			request = request.clone({
				setHeaders: {
					Authorization: authData
				}
			});
		}

		return next.handle(request);
	}
}
