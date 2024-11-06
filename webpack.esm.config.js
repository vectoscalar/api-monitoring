// const path = require('path');

// module.exports = {
//   entry: './dist/esm/index.js', // Point to the ESM entry point
//   output: {
//     path: path.resolve(__dirname, 'dist/bundled'),
//     filename: 'index.esm.bundle.mjs',
//     libraryTarget: 'module', // Ensure ESM format
//     chunkFormat: 'module', // Set chunk format to 'module' for ESM output
//   },
//   target: 'node',
//   mode: 'production', // Enable production optimizations
//   experiments: {
//     outputModule: true, // Allow Webpack to output as an ES module
//   },
//   externalsPresets: { node: true }, // Prevents bundling of Node.js built-ins
// };

const path = require('path');

module.exports = {
  entry: './index.ts', // Point directly to the TypeScript entry point
  output: {
    path: path.resolve(__dirname, 'dist/bundled'),
    filename: 'index.esm.bundle.mjs',
    libraryTarget: 'module', // Ensure ESM format
    chunkFormat: 'module', // Set chunk format to 'module' for ESM output
  },
  target: 'node', // Keep this for Node.js compatibility
  mode: 'production', // Enable production optimizations
  experiments: {
    outputModule: true, // Allow Webpack to output as an ES module
  },
  externalsPresets: { node: true }, // Prevent bundling of Node.js built-ins
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      util: require.resolve('util/'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'), // Add if you need stream support
      // Add more polyfills as necessary for other missing modules
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Match TypeScript files
        // use: 'ts-loader', // Use ts-loader for transpiling
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true, // Skip type checking
          },
        },
        exclude: /node_modules/, // Exclude node_modules
      },
    ],
  },
};
