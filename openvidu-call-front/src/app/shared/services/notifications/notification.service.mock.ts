import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class NotificationServiceMock {
	constructor() {}

	newMessage(nickname: string, callback) {}

	private launchNotification(message: string, action: string, className: string, durationTimeMs: number): MatSnackBarRef<SimpleSnackBar> {
		return null;
	}
}
