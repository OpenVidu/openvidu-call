import { Pipe, PipeTransform } from '@angular/core';
import { NgxLinkifyjsService } from 'ngx-linkifyjs';
@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
	constructor(public linkifyService: NgxLinkifyjsService) {}
	transform(str: string): string {
		return str ? this.linkifyService.linkify(str) : str;
	}
}
