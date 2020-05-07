import { Injectable } from '@angular/core';

@Injectable()
export class StorageServiceMock {
	constructor() {}

	public set(key: string, item: any) {}
	public get(key: string) {}
	public clear() {}
}
