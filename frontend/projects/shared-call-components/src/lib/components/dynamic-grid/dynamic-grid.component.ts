import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
	selector: 'ov-dynamic-grid',
	standalone: true,
	imports: [CommonModule, MatGridListModule],
	templateUrl: './dynamic-grid.component.html',
	styleUrl: './dynamic-grid.component.scss'
})
export class DynamicGridComponent {
	@Input() maxColumns: number = 3; // Maximum number of columns
	columns: number = 1; // Current number of columns
	private itemsCount: number = 0;

	ngOnInit() {
		this.updateColumns();
	}

	@HostListener('window:resize', ['$event'])
	onResize() {
		this.updateColumns();
	}

	private updateColumns() {
		// Count the number of items
		const content = document.querySelector('.card-container');
		if (content) {
			this.itemsCount = content.childElementCount;
			const containerWidth = content.clientWidth;
			const columnWidth = 350; // Minimum width of each card

			// Calculate the number of columns based on the container width
			const calculatedColumns = Math.floor(containerWidth / columnWidth);
			this.columns = Math.min(calculatedColumns, this.maxColumns, this.itemsCount); // Set the number of columns
		}
	}
}
