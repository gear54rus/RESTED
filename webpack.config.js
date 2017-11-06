const { resolve } = require('path');
const webpack = require('webpack');

const rootDir = resolve(__dirname);

module.exports = function getConfig(environment) {
  const env = environment || {};
  const {
    production,
  } = env;

  return {
    context: rootDir,

    entry: [
      'babel-polyfill',
      './src/index.js',
    ],

    output: {
      path: rootDir + '/dist',
      filename: 'rested-aps.js',
    },

    performance: {hints: false},
    devtool: production ? undefined : 'inline-source-map',

    // Compiler plugins. See https://github.com/webpack/docs/wiki/list-of-plugins
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: !production,
        options: {
          eslint: {
            failOnWarning: production,
            failOnError: production,
          }
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      }),
    ],

    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'eslint-loader',
          include: resolve(rootDir, 'src'),
          options: {
            cache: false,
          }
        },
        {
          test: /\.js/,
          include: resolve(rootDir, 'src'),
          loader: 'babel-loader',
          options: {
            cacheDirectory: !production,
          }
        }
      ]
    },

    resolve: {
      modules: [
        resolve(rootDir, 'src'),
        'node_modules',
      ],
    }
  }
};
