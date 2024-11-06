import type { Options } from 'tsup';

export const tsup: Options = {
  splitting: false,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: false,
  bundle: true,
  skipNodeModulesBundle: true,
  target: 'es2020',
  outDir: 'dist',
  entry: ['./index.ts'], //include all files under src
};
