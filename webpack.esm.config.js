const path = require('path');

module.exports = {
  entry: './dist/esm/index.js', // Point to the ESM entry point
  output: {
    path: path.resolve(__dirname, 'dist/bundled'),
    filename: 'index.esm.bundle.mjs',
    libraryTarget: 'module', // Ensure ESM format
    chunkFormat: 'module', // Set chunk format to 'module' for ESM output
  },
  target: 'node',
  mode: 'production', // Enable production optimizations
  experiments: {
    outputModule: true, // Allow Webpack to output as an ES module
  },
  externalsPresets: { node: true }, // Prevents bundling of Node.js built-ins
  externals: {
    'better-queue-memory': 'commonjs better-queue-memory', // Externalize specific dependencies
  },
};
