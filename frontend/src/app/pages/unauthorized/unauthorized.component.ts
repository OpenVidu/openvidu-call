import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'app-unauthorized',
	standalone: true,
	imports: [],
	templateUrl: './unauthorized.component.html',
	styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent implements OnInit {
	message = 'Unauthorized access';
	constructor(private route: ActivatedRoute) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			if (params['reason'] === 'no-token') {
				this.message = 'No token provided';
			}
		});
	}
}
