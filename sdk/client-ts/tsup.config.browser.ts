import { defineConfig } from 'tsup';
import * as pkg from './package.json';

const bundleName = `openvidu-embedded-${pkg.version}`;
export default defineConfig({
	entry: { [bundleName]: 'src/index.ts' },
	format: ['iife'],
	outDir: 'dist/browser',
	dts: false,
	clean: true,
	globalName: 'OpenViduEmbedded',
	platform: 'browser',
	minify: true,
	outExtension({ format }) {
		return {
			js: `.js`,
		};
	},
});
