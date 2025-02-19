import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
	displayName: 'backend',
	...createDefaultEsmPreset({
		tsconfig: 'tsconfig.json'
	}),
	resolver: 'ts-jest-resolver',
	testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
	moduleFileExtensions: ['js', 'ts', 'json', 'node'],
	testEnvironment: 'node',
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	}
};

export default jestConfig;
