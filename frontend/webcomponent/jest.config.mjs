import { createDefaultEsmPreset } from 'ts-jest'

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  displayName: 'webcomponent',
  ...createDefaultEsmPreset({
    tsconfig: 'tsconfig.json'
  }),
  resolver: 'ts-jest-resolver',
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/e2e/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
}

export default jestConfig
