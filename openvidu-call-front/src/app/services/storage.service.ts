import { Injectable } from '@angular/core';

const enum Storage {
	ADMIN_CREDENTIALS = 'ovCallAdminAuth',
	USER_CREDENTIALS = 'ovCallUserAuth',
	USER_NAME = 'ovCallUserName'
}

/**
 * @internal
 */
@Injectable({
	providedIn: 'root'
})
export class StorageService {
	private storage = window.localStorage;

	setAdminCredentials(credentials: { username: string; password: string }) {
		const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
		this.set(Storage.ADMIN_CREDENTIALS, encodedCredentials);
	}

	getAdminCredentials(): { username: string; password: string } {
		const encodedCredentials = this.get(Storage.ADMIN_CREDENTIALS);

		if (encodedCredentials) {
			const [username, password] = atob(encodedCredentials).split(':');
			return { username, password };
		}

		return null;
	}

	clearAdminCredentials() {
		this.remove(Storage.ADMIN_CREDENTIALS);
	}

	setUserName(username: string) {
		this.set(Storage.USER_NAME, username);
	}

	getUserName(): string {
		return this.get(Storage.USER_NAME);
	}

	setUserCredentials(credentials: { username: string; password: string }) {
		const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
		this.setUserName(credentials.username);
		this.set(Storage.USER_CREDENTIALS, encodedCredentials);
	}

	getUserCredentials(): { username: string; password: string } | null {
		const encodedCredentials = this.get(Storage.USER_CREDENTIALS);

		if (encodedCredentials) {
			const [username, password] = atob(encodedCredentials).split(':');
			return { username, password };
		}

		return null;
	}

	clearUserCredentials() {
		this.remove(Storage.USER_CREDENTIALS);
	}

	private set(key: string, item: any) {
		const value = JSON.stringify({ item: item });
		this.storage.setItem(key, value);
	}

	private get(key: string): any {
		const str = this.storage.getItem(key);

		if (str) {
			return JSON.parse(str).item;
		}

		return null;
	}

	private remove(key: string) {
		this.storage.removeItem(key);
	}

	public clear() {
		this.storage.clear();
	}
}
