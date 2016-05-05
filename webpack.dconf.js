
import _ from 'lodash';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

function base() {
  return {
    module: {
      loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },{
        test: /\.scss$/,
        loaders: ["style", "css", "postcss", "resolve-url", "sass?sourceMap"]
      },{
        test: /\.css$/,
        loaders: ["style", "css", "postcss"]
      },{
        test: /\.png$/,
        loader: "file-loader"
      },
        { test: /\.woff$/,   loader: "url-loader?limit=10000&minetype=font/woff" },
        { test: /\.woff2$/,   loader: "url-loader?limit=10000&minetype=font/woff2" },
        { test: /\.ttf$/,    loader: "file-loader" },
        { test: /\.eot$/,    loader: "file-loader" },
        { test: /\.svg$/,    loader: "file-loader" }
      ]
    },
    plugins: [],
    externals: {},
    resolve: {
      alias: {}
    },
    postcss: function () {
      return [autoprefixer];
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

/* so that we can use CLIENT_PATH in frontend test instead of specifying directory directly */
function karmaClientModuleAlias(wc) {
  wc.resolve.alias.CLIENT_PATH = process.env.CLIENT_PATH || path.resolve('./client/');
  return wc;
}

export const dev = _.flow(base, sourceMaps);
export const prod = _.flow(base, uglify);
export const karma =_.flow(base, inlineSourceMaps, jsonLoader, reactKarmaExternals, karmaClientModuleAlias);
