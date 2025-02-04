import { defineConfig } from 'tsup';

export default defineConfig({
	entry:  ['src/index.ts'],
	format: ["esm", "cjs"],
	target: 'esnext',
	outDir: 'dist/npm',
	minify: true,
	dts: true,
	sourcemap: true,
	clean: true,
});
