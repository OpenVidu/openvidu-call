import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	constructor(private snackBar: MatSnackBar) {}

	newMessage(nickname: string, callback) {
		const alert = this.launchNotification(nickname + ' sent a message', 'OPEN', 'messageSnackbar', 3000);
		alert.onAction().subscribe(() => {
			callback();
		  });
	}

	private launchNotification(message: string, action: string, className: string, durationTimeMs: number): MatSnackBarRef<SimpleSnackBar> {
		return this.snackBar.open(message, action, {
			duration: durationTimeMs,
			verticalPosition: 'top',
			horizontalPosition: 'end',
			panelClass: className
		});
	}
}
