import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { DialogOptions } from '../../models';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private spinnerRef: any;

	constructor(
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private overlay: Overlay
	) {}

	showSpinner() {
		if (!this.spinnerRef) {
			const overlayRef = this.overlay.create({
				positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
				panelClass: 'spinner-overlay'
			});

			this.spinnerRef = overlayRef.attach(new ComponentPortal(SpinnerComponent));
		}
	}
	hideSpinner(): void {
		if (this.spinnerRef) {
			this.spinnerRef.detach();
			this.spinnerRef = null;
		}
	}

	showSnackbar(message: string, duration: number = 3000): void {
		this.snackBar.open(message, 'Cerrar', {
			duration,
			verticalPosition: 'top',
			horizontalPosition: 'right',
			panelClass: 'custom-snackbar'
		});
	}

	showDialog(options: DialogOptions): void {
		this.dialog.open(DialogComponent, {
			data: options,
			width: '400px',
			disableClose: true
		});
	}

	showAlert(message: string): void {
		// this.dialog.open(AlertDialogComponent, {
		// 	data: {
		// 		message,
		// 		confirmText: 'OK'
		// 	},
		// 	width: '300px',
		// 	disableClose: true
		// });
	}
}
