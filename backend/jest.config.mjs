import { createDefaultEsmPreset } from 'ts-jest'

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  displayName: 'type-module',
  ...createDefaultEsmPreset({
    tsconfig: 'tsconfig.json',
  }),
  resolver: 'ts-jest-resolver'
}

export default jestConfig