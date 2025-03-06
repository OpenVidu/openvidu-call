import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
	selector: 'ov-disconnected',
	standalone: true,
	imports: [MatCardModule],
	templateUrl: './disconnected.component.html',
	styleUrl: './disconnected.component.scss'
})
export class DisconnectedComponent {}
