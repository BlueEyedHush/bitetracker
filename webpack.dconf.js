const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

function base() {
  return {
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel'
      }, {
        test: /\.scss$/,
        loaders: ['style', 'css', 'postcss', 'resolve-url', 'sass?sourceMap']
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
    plugins: [],
    externals: {},
    postcss: function () {
      return [autoprefixer];
    },
    resolve: {
      extensions: ['', '.js', '.jsx', '.json']
    }
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
