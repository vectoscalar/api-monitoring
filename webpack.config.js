const path = require('path');

module.exports = {
  entry: './index.ts', // Point directly to the TypeScript entry point
  output: {
    path: path.resolve(__dirname, 'dist/bundled'),
    filename: 'index.cjs.bundle.js', // Change the filename for CJS output
    libraryTarget: 'commonjs2', // Use commonjs2 for CJS format
  },
  target: 'node', // Ensure the target is Node.js
  mode: 'production', // Enable production optimizations
  resolve: {
    extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
    fallback: {
      util: require.resolve('util/'), // Polyfill for 'util'
      os: require.resolve('os-browserify/browser'), // Polyfill for 'os'
      stream: require.resolve('stream-browserify'), // Polyfill for 'stream' if needed
      child_process: false, // Exclude 'child_process' if not needed
      // Add more polyfills as necessary for other missing modules
    },
    alias: {
      'better-queue-memory': path.resolve(__dirname, 'node_modules/better-queue-memory')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
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
