import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

export const checkAdminAuthenticatedGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// Check if admin is authenticated
	const isAuthenticated = await authService.isAdminAuthenticated();
	if (!isAuthenticated) {
		// Redirect to login page
		router.navigate(['console/login']);
		return false;
	}

	// Allow access to the requested page
	return true;
};

export const checkAdminNotAuthenticatedGuard: CanActivateFn = async (
	route: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	// Check if admin is not authenticated
	const isAuthenticated = await authService.isAdminAuthenticated();
	if (isAuthenticated) {
		// Redirect to console page
		router.navigate(['console']);
		return false;
	}

	// Allow access to the requested page
	return true;
};
