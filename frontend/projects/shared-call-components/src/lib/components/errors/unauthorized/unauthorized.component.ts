import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'ov-unauthorized',
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
			} else if (params['reason'] === 'no-iframe') {
				this.message = 'The page is not accessible directly. Please use the OpenVidu embedded';
			}
		});
	}
}
