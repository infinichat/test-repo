const path = require('path');

module.exports = {
  entry: './src/widget.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist') // Output directory
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
    },
  },
  resolve: {
    fallback: {
      "url": require.resolve("url/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
