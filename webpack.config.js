const { resolve } = require('path');
const webpack = require('webpack');

module.exports = (env = {}) => {
  const rootDir = resolve(__dirname);
  const isProduction = Boolean(env.production);

  const plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    }),
  ];

  if (isProduction) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
  }

  return {
    entry: {
      'dist/rested-aps': ['babel-polyfill', './src/index.js'],
      'dist/background': './src/background.js',
      'dist/content': './src/content.js',
    },

    output: {
      path: rootDir,
      filename: '[name].js',
    },

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'eslint-loader',
          include: resolve(rootDir, 'src'),
          options: {
            failOnWarning: isProduction,
            failOnError: isProduction,
            cache: false,
          }
        },
        {
          test: /\.js/,
          include: resolve(rootDir, 'src'),
          loader: 'babel-loader',
          options: { cacheDirectory: !isProduction },
        }
      ]
    },

    resolve: {
      modules: [
        resolve(rootDir, 'src'),
        'node_modules',
      ],
    },

    performance: { hints: false },
    devtool: isProduction ? false : 'inline-source-map',
    context: rootDir,
    plugins,
  };
};
