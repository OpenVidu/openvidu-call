import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
	selector: 'ov-toggle-card',
	standalone: true,
	imports: [MatCardModule, MatIconModule, MatSlideToggleModule],
	templateUrl: './toggle-card.component.html',
	styleUrl: './toggle-card.component.scss'
})
export class ToggleCardComponent {
	/**
	 * The title of the dynamic card component.
	 * This input property allows setting a custom title for the card.
	 */
	@Input() title: string = '';
	/**
	 * A brief description of the dynamic card component.
	 * This input property allows setting a description for the card.
	 */
	@Input() description: string = '';
	/**
	 * The name of the icon to be displayed. Defaults to "settings".
	 *
	 * @type {string}
	 * @default 'settings'
	 */
	@Input() icon: string = 'settings'; // Nombre del ícono (por defecto "settings")
	/**
	 * The background color of the icon.
	 *
	 * @default '#000000'
	 */
	@Input() iconBackgroundColor: string = '#000000';
	/**
	 * The background color of the card component.
	 * Accepts any valid CSS color string.
	 */
	@Input() cardBackgroundColor: string = '#ffffff';

	/**
	 * A boolean input property that determines the toggle state. Only applicable when `footerType` is set to `'toggle'`.
	 * Defaults to `false`.
	 */
	@Input() toggleValue: boolean = false;

	@Output() onToggleValueChanged = new EventEmitter<boolean>();
	@Output() onTextLinkClicked = new EventEmitter<void>();

	onToggleChange(event: any) {
		this.onToggleValueChanged.emit(event.checked);
	}

	onLinkClick() {
		this.onTextLinkClicked.emit();
	}
}
