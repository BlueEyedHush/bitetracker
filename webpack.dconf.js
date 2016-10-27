const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const OfflinePlugin = require('offline-plugin');

function base() {
  return {
    output: {
      filename: '[hash].bundle.js',
    },
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel',
        include: [/src[\/\\]node_modules/]
      }, {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'resolve-url', 'sass?sourceMap', 'sass-resources'],
      }, {
        test: /\.css$/,
        loaders: ['style', 'css', 'postcss']
      }, {
        test: /\.png$/,
        loader: 'file'
      },
        {test: /\.woff$/, loader: 'url?limit=10000&minetype=font/woff'},
        {test: /\.woff2$/, loader: 'url?limit=10000&minetype=font/woff2'},
        {test: /\.ttf$/, loader: 'file'},
        {test: /\.eot$/, loader: 'file'},
        {test: /\.svg$/, loader: 'file'}
      ]
    },
    plugins: [
      // Offline plugin should be the last plugin on the list
      new OfflinePlugin({
        caches: {
          main: ['app.html', '*.bundle.js'],
          additional: ['*.+(woff|woff2|ttf|eot|svg)'],
        },
        externals: ['app.html'],
        ServiceWorker: {
          navigateFallbackURL: '/app.html',
        },
        AppCache: {
          FALLBACK: {
            '/app.html': '/app.html',
          },
        },
      }),
    ],
    externals: {},
    postcss: function () {
      return [autoprefixer];
    },
    resolve: {
      extensions: ['', '.js', '.jsx', '.json'],
      alias: {
        'alt-instance': 'client/app/alt',
        'components': 'client/app/components',
        'actions': 'client/app/actions',
        'stores': 'client/app/stores',
        'sources': 'client/app/sources',
        'schemas': 'client/app/schemas',
        'mixins': 'client/app/mixins',
      },
    },
    sassResources: './src/node_modules/client/assets/resources.scss',
  };
}

function inlineSourceMaps(wc) {
  wc.devtool = 'inline-source-map';
  return wc;
}

function sourceMaps(wc) {
  wc.devtool = 'source-map';
  return wc;
}

function uglify(wc) {
  wc.plugins.unshift(new webpack.optimize.UglifyJsPlugin());
  return wc;
}

function jsonLoader(wc) {
  wc.module.loaders.push({test: /\.json$/, loader: 'json'});
  return wc;
}

/* externals required if we want react to work correctly with karma */
function reactKarmaExternals(wc) {
  wc.externals['react/addons'] = true;
  wc.externals['react/lib/ExecutionEnvironment'] = true;
  wc.externals['react/lib/ReactContext'] = true;
  return wc;
}

function babelRewirePlugin(wc) {
  wc.module.loaders[0].query = {
    /* this will be merged with appropriate .babelrc file (and .babelrc has priority) */
    plugins: ['rewire']
  };

  return wc;
}

const dev = _.flow(base, sourceMaps);
const prod = _.flow(base, uglify);
const karma = _.flow(base, inlineSourceMaps, jsonLoader, reactKarmaExternals, babelRewirePlugin);

module.exports = {
  dev: dev,
  prod: prod,
  karma: karma
};
