import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '../services/utils/utils.service';

@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
	constructor(public utilsSrv: UtilsService) {}
	transform(str: string): string {
		return str ? this.utilsSrv.linkify(str) : str;
	}
}
