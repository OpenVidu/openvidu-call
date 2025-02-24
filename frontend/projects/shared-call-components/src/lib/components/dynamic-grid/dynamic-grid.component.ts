import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
	selector: 'ov-dynamic-grid',
	standalone: true,
	imports: [CommonModule, MatGridListModule],
	templateUrl: './dynamic-grid.component.html',
	styleUrls: ['./dynamic-grid.component.scss'],
	encapsulation: ViewEncapsulation.Emulated // Ensures styles do not affect other components
})
export class DynamicGridComponent implements OnInit {
	/** Maximum number of columns */
	@Input() maxColumns: number = 3;

	/** Spacing between items (e.g., '16px') */
	@Input() gutter: string = '16px';

	/** Layout mode: 'grid' | 'masonry' */
	@Input() layoutMode: 'grid' | 'masonry' = 'grid';

	/** Enable or disable the header */
	@Input() withHeader: boolean = false;

	/** Controls the current number of columns */
	columns: number = 1;

	constructor(private breakpointObserver: BreakpointObserver) {}

	ngOnInit(): void {
		this.setupGrid();
	}

	/** Configures the grid to respond to size changes */
	private setupGrid(): void {
		this.breakpointObserver
			.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
			.subscribe((result) => {
				if (result.breakpoints[Breakpoints.XSmall]) {
					this.columns = Math.min(1, this.maxColumns);
				} else if (result.breakpoints[Breakpoints.Small]) {
					this.columns = Math.min(2, this.maxColumns);
				} else if (result.breakpoints[Breakpoints.Medium]) {
					this.columns = Math.min(3, this.maxColumns);
				} else if (result.breakpoints[Breakpoints.Large]) {
					this.columns = Math.min(4, this.maxColumns);
				} else if (result.breakpoints[Breakpoints.XLarge]) {
					this.columns = Math.min(5, this.maxColumns);
				}
			});
	}

	/**
	 * Calculates the span of a card.
	 * @param span Number of columns the card should occupy.
	 */
	getColSpan(span: number | undefined): number {
		if (span && span >= 1 && span <= this.maxColumns) {
			return span;
		}
		return 1;
	}
}
