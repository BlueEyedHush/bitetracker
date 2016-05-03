
var path = require('path');

/* to determine actual list of browsers on which frontend tests should be run intersection of this array and
 * autodetection results is taken. Currently avaliable:
 * - Chrome
 * - ChromeCanary
 * - Firefox
 * - Opera
 * - Safari (only Mac)
 * - PhantomJS
 * - IE (only Windows)
 * */
var browserFilter = ['Chrome', 'Firefox', 'Opera', 'Safari', 'PhantomJS', 'IE'];

module.exports = function(config) {
  config.set({
    detectBrowsers: {
      // enable/disable, default is true
      enabled: true,

      // enable/disable phantomjs support, default is true
      usePhantomJS: true,

      // post processing of browsers list
      // here you can edit the list of browsers used by karma
      postDetection: function(availableBrowser) {

        var result = [];

        // filter browsers according to browser filter
        browserFilter.forEach((b) => {
          if(availableBrowser.indexOf(b) > -1) {
            result.push(b);
          }
        });

        //Add IE Emulation
        if (availableBrowser.indexOf('IE')>-1) {
          result.push('IE9');
        }

        //Remove PhantomJS if another browser has been detected
        if (availableBrowser.length > 1 && availableBrowser.indexOf('PhantomJS')>-1) {
          var i = result.indexOf('PhantomJS');

          if (i !== -1) {
            result.splice(i, 1);
          }
        }

        console.log("Browsers remaiming after applying filter: " + result.toString());

        return result;
      }
    },

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha', 'chai', 'detectBrowsers', 'sinon-chai', 'chai-as-promised', 'chai-things'],

    webpack: { //kind of a copy of your webpack config
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
          },{
            test: /\.scss$/,
            loaders: ["style", "css", "sass"]
          },{
            test: /\.css$/,
            loaders: ["style", "css"]
          },{
            test: /\.png$/,
            loader: "file-loader"
          },
          {
            test: /\.json$/,
            loader: 'json',
          }]
      },
      externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },
      resolve: {
        alias: {
          CLIENT_PATH: process.env.CLIENT_PATH || path.resolve('./client/')
        }
      }
    },

    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    },

    // list of files / patterns to load in the browser
    files: [
      'tests/client/componentsTests/**/*.jsx'
    ],

    // list of files / patterns to exclude
    exclude: [],

    preprocessors: {
      'tests/client/componentsTests/**/*.jsx': ['webpack', 'sourcemap']
    },

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // reporter types:
    // - dots
    // - progress (default)
    // - spec (karma-spec-reporter)
    // - junit
    // - growl
    // - coverage
    reporters: ['mocha'],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
