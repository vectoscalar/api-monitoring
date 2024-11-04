const path = require('path');

module.exports = {
  entry: './dist/cjs/index.js', // The CJS entry point from TypeScript build
  output: {
    path: path.resolve(__dirname, 'dist/bundled'), // Output directory
    filename: 'index.bundle.js', // Output file name
    libraryTarget: 'commonjs2', // CJS compatibility for Node.js
  },
  target: 'node',
  mode: 'production', // Enables basic optimizations
  externalsPresets: { node: true },
  externals: {
    'better-queue-memory': 'commonjs better-queue-memory', // Leave out only this dependency
  },
  optimization: {
    minimize: true, // Minify output
    usedExports: true, // Tree-shake unused exports
  },
};
