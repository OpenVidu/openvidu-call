import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
	const authService: AuthService = inject(AuthService);

	req = req.clone({
		withCredentials: true
	});

	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 401) {
				// Expired access token
				console.log('Refreshing token...');
				return authService.adminRefresh().pipe(
					switchMap(() => {
						console.log('Token refreshed');
						return next(req);
					}),
					catchError(() => {
						console.log('Error refreshing token. Logging out...');
						authService.adminLogout();
						throw error;
					})
				);
			}

			throw error;
		})
	);
};
