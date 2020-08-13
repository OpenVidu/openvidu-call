import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { TokenService } from './token.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerServiceMock } from '../logger/logger.service.mock';
import { NetworkService } from '../network/network.service';
import { NetworkServiceMock } from '../network/network.service.mock';
import { ExternalConfigModel } from '../../models/external-config';
import { OvSettingsModel } from '../../models/ovSettings';

describe('TokenService', () => {
	let service: TokenService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: LoggerService, useClass: LoggerServiceMock },
				{ provide: NetworkService, useClass: NetworkServiceMock }
			]
		});
		service = TestBed.inject(TokenService);
		service.initialize(new OvSettingsModel());
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should be defined webcamToken and screenToken', () => {
		expect(service['webcamToken']).toBeDefined();
		expect(service['screenToken']).toBeDefined();
	});

	it('should be defined ovSettings', () => {
		expect(service['ovSettings']).toBeDefined();
	});

	it('should both tokens be initialized from externalConfig', async () => {
		const externalConfigMock = new ExternalConfigModel();
		externalConfigMock.setTokens(['token1', 'token2']);
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(externalConfigMock);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token1');
		expect(service['screenToken']).toEqual('token2');
	});

	it('should only webcamToken be initialized from externalConfig', async () => {
		const externalConfigMock = new ExternalConfigModel();
		externalConfigMock.setTokens(['token1']);
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(externalConfigMock);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token1');
		expect(service['screenToken']).not.toBeDefined();
	});

	it('should only webcamToken be initialized from externalConfig with screen disabled', async () => {
		const externalConfigMock = new ExternalConfigModel();
		const ovSettingsMock = new OvSettingsModel();
		ovSettingsMock.setScreenSharing(false);
		service['ovSettings'] = ovSettingsMock;

		externalConfigMock.setTokens(['token1', 'token2']);
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(externalConfigMock);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token1');
		expect(service['screenToken']).not.toBeDefined();
	});

	it('should only webcamToken be initialized from externalConfig with ovSettings undefined', async () => {
		const externalConfigMock = new ExternalConfigModel();
		service['ovSettings'] = undefined;
		externalConfigMock.setTokens(['token1', 'token2']);
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(externalConfigMock);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token1');
		expect(service['screenToken']).not.toBeDefined();
	});

	it('should tokens be initialized from backend', fakeAsync(async () => {
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();
		const generateWebcamTokenSpy = spyOn<any>(service, 'generateWebcamToken').and.callThrough();
		const generateScreenToken = spyOn<any>(service, 'generateScreenToken').and.callThrough();

		await service.initTokens(null);
		flush();

		expect(initTokenSpy).toHaveBeenCalled();
		expect(generateWebcamTokenSpy).toHaveBeenCalled();
		expect(generateScreenToken).toHaveBeenCalled();

		expect(service['webcamToken']).toEqual('token');
		expect(service['screenToken']).toEqual('token');
	}));

	it('should only webcamToken be initialized from backend with screen disabled', async () => {

		const ovSettingsMock = new OvSettingsModel();
		ovSettingsMock.setScreenSharing(false);
		service['ovSettings'] = ovSettingsMock;
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(null);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token');
		expect(service['screenToken']).toEqual('');
	});

	it('should only webcamToken be initialized from backend with ovSettings undefined', async () => {

		service['ovSettings'] = null;
		const initTokenSpy = spyOn(service, 'initTokens').and.callThrough();

		await service.initTokens(null);

		expect(initTokenSpy).toHaveBeenCalled();
		expect(service['webcamToken']).toEqual('token');
		expect(service['screenToken']).toEqual('');
	});
});
