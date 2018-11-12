import { Pipe, PipeTransform } from '@angular/core';
import * as linkifyString from 'linkifyjs/string';

@Pipe({name: 'linkify'})
export class LinkifyPipe implements PipeTransform {
  transform(str: string): string {
    return str ? linkifyString(str, {target: '_system'}) : str;
  }
}
