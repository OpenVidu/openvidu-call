import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.services';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {}
	// Intercept all rest request for adding the authorization header
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const authData = this.authService.getCredentialsFromStorage();
		if (!!authData) {
			request = request.clone({
				setHeaders: {
					Authorization: `Basic ${authData}`
				}
			});
		}

		return next.handle(request);
	}
}
