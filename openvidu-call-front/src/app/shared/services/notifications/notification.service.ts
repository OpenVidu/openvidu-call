import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	constructor(private snackBar: MatSnackBar) {}


	newMessage(message: string) {
		this.launchNotification(message, 'OPEN', 'messageSnackbar', 2000);
	}

	private launchNotification(message: string, action: string, className: string, durationTimeMs: number) {
		this.snackBar.open(message, action, {
			duration: durationTimeMs,
			verticalPosition: 'top',
			horizontalPosition: 'end',
			panelClass: className
		});
	}

}
