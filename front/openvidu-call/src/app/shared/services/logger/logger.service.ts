import { Injectable } from '@angular/core';
import { ILogService } from '../../types/logger-type';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class LoggerService implements ILogService {
	public log = window.console;
	public LOG_FNS = [];
	public MSG_PREFIXES = [
		['[', ']'],
		['[', '] WARN: '],
		['[', '] ERROR: ']
	];

	constructor() {
		this.LOG_FNS = [this.log.log, this.log.warn, this.log.error];
	}

	public get(prefix: string) {
		const isDebugMode = !environment.production;
		if (isDebugMode) {
			// this.LOG_FNS[0].call(this.log, '[' + prefix + '] Logger created');
		}
		const loggerFns = this.LOG_FNS.map((logTemplFn, i) => {
			return logTemplFn.bind(this.log, this.MSG_PREFIXES[i][0] + prefix + this.MSG_PREFIXES[i][1]);
		});
		return {
			d: function(...args: any[]) {
				if (isDebugMode) {
					loggerFns[0].apply(this.log, arguments);
				}
			},
			w: function(...args: any[]) {
				if (isDebugMode) {
					loggerFns[1].apply(this.log, arguments);
				}
			},
			e: function(...args: any[]) {
				if (isDebugMode) {
					loggerFns[2].apply(this.log, arguments);
				}
			}
		};
	}
}
