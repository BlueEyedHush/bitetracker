'use strict';

import path from 'path';
import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import {stream as wiredep} from 'wiredep';
import nodemon from 'nodemon';
import {Server as KarmaServer} from 'karma';
import runSequence from 'run-sequence';
import {protractor, webdriver_update} from 'gulp-protractor';
import {Instrumenter} from 'isparta';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import plumber from 'gulp-plumber';
import yargs from 'yargs';
import * as wpConf from './webpack.dconf';

import debug from 'gulp-debug'

const argv = yargs
  .alias('b', 'browsers')
  .argv;

var plugins = gulpLoadPlugins();

const out = 'build';
const clientPath = 'client';
const serverPath = 'server';
const clientOut = `${out}/client`;
const serverOut = `${out}/server`;
const indexDir = `${clientPath}/index`;
const appDir = `${clientPath}/app`;

const paths = {
    client: {
        // what will be linted
        linting: [
            `${clientPath}/**/*.js`,
            `${clientPath}/**/*.jsx`
        ],
        index: {
          entrypoint: `${indexDir}/index.jsx`,
          htmlTemplate: `${clientPath}/index.html`,
          outputPageName: 'index.html'
        },
        app: {
          entrypoint: `${appDir}/app.jsx`,
          htmlTemplate: `${clientPath}/app.html`,
          outputPageName: 'app.html'
        },
        test: [`${clientPath}/{app,components}/**/*.{spec,mock}.js`],
        e2e: ['e2e/**/*.spec.js'],
        // copied to client directory without processing
        extras: [
          `${clientPath}/favicon.ico`,
          `${clientPath}/robots.txt`,
          `${clientPath}/.htaccess`
        ]
    },
    server: {
        scripts: [`${serverPath}/**/!(*.spec|*.integration).js`],
        json: [`${serverPath}/**/*.json`],
        test: {
          integration: [`${serverPath}/**/*.integration.js`, 'mocha.global.js'],
          unit: [`${serverPath}/**/*.spec.js`, 'mocha.global.js']
        }
    },
    karma: 'karma.conf.js'
};

/******************************
 * Webpack config compositors
 ******************************/

function htmlPage(wc, filename, template) {
  wc.plugins.push(new HtmlWebpackPlugin({
    filename: filename,
    template: template,
    inject: 'body'
  }));
  return wc;
}

function webpackConf(baseConfig, pathsConfig) {
  return (_.flow(baseConfig, _.partialRight(htmlPage, pathsConfig.outputPageName, pathsConfig.htmlTemplate)))();
}

/********************
 * Reusable pipelines
 ********************/

let lintServerScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let lintServerTestScripts = lazypipe()
    .pipe(plugins.jshint, `${serverPath}/.jshintrc-spec`)
    .pipe(plugins.jshint.reporter, 'jshint-stylish');

let mocha = lazypipe()
    .pipe(plugins.mocha, {
        reporter: 'spec',
        timeout: 5000,
        require: [
            './mocha.conf'
        ]
    });

let istanbul = lazypipe()
    .pipe(plugins.istanbul.writeReports)
    .pipe(plugins.istanbulEnforcer, {
        thresholds: {
            global: {
                lines: 80,
                statements: 80,
                branches: 80,
                functions: 80
            }
        },
        coverageDirectory: './coverage',
        rootDirectory : ''
    });

/********************
 * Env
 ********************/

function commonConfig() {
  process.env.CLIENT_ROOT = clientOut;
}

gulp.task('env', () => {
  commonConfig();
  process.env.SERVER_ROOT = serverPath;
  process.env.NODE_ENV = 'development';
});

gulp.task('env:test', () => {
  commonConfig();
  process.env.SERVER_ROOT = serverPath;
  process.env.NODE_ENV = 'test';
});

gulp.task('env:prod', () => {
  commonConfig();
  process.env.SERVER_ROOT = serverOut;
  process.env.NODE_ENV = 'production';
});

/********************
 * Tasks
 ********************/

gulp.task('lint:scripts:server', () => {
    return gulp.src(_.union(paths.server.scripts, _.map(paths.server.test, blob => '!' + blob)))
        .pipe(lintServerScripts());
});

gulp.task('lint:scripts:serverTest', () => {
    return gulp.src(paths.server.test)
        .pipe(lintServerTestScripts());
});

gulp.task('jscs', () => {
  return gulp.src(_.union(paths.client.scripts, paths.server.scripts))
      .pipe(plugins.jscs())
      .pipe(plugins.jscs.reporter());
});

gulp.task('start:server:prod', () => {
    nodemon(`-w ${serverOut} ${serverOut}`).on('log', onServerLog);
});

gulp.task('start:server', () => {
    nodemon(`-w ${serverPath} ${serverPath}`).on('log', onServerLog);
});

function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
    plugins.util.colors.yellow('nodemon') +
    plugins.util.colors.white('] ') +
    log.message);
}

gulp.task('serve', cb => {
  runSequence(
    'build',
    'env',
    'start:server',
    'watch',
    cb);
});

gulp.task('serve:dist', cb => {
  runSequence(
    'build:prod',
    'env:prod',
    'start:server:prod',
    cb);
});

gulp.task('watch', () => {
  plugins.livereload.listen();

  const intellijTempFileSuffix = '___jb_tmp___';
  const webpackDevIndex = webpackConf(wpConf.dev, paths.client.index);
  const webpackDevApp = webpackConf(wpConf.dev, paths.client.app);

  plugins.watch([`${appDir}/**/*`, paths.client.app.htmlTemplate, `!/**/*${intellijTempFileSuffix}`],{
    name: 'AppWatcher'
  }, () => {
    gulp.src(paths.client.app.entrypoint)
      .pipe(plumber())
      .pipe(webpackStream(webpackDevApp).on('error', function() {this.emit('end')}))
      .pipe(gulp.dest(clientOut))
      .pipe(plugins.livereload());
  });

  return plugins.watch([`${indexDir}/**/*`, paths.client.index.htmlTemplate, `!/**/*${intellijTempFileSuffix}`],{
      name: 'IndexWatcher'
    }, () => {
    gulp.src(paths.client.index.entrypoint)
      .pipe(plumber())
      .pipe(webpackStream(webpackDevIndex).on('error', function() {this.emit('end')}))
      .pipe(gulp.dest(clientOut))
      .pipe(plugins.livereload());
  });
});

gulp.task('test', cb => {
    return runSequence('test:server', 'test:client', cb);
});

gulp.task('test:server', cb => {
    runSequence(
        'env:test',
        'mocha:unit',
        'mocha:integration',
        'mocha:coverage',
        cb);
});

gulp.task('mocha:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha());
});

gulp.task('mocha:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha());
});

gulp.task('test:client', (done) => {
  startKarmaServer(false, done);
});

gulp.task('test:client:cont', (done) => {
  startKarmaServer(true, done);
});

const SUPPORTED_BROWSERS = ['IE', 'Firefox', 'Chrome', 'Opera', 'Safari', 'PhantomJS'];

function startKarmaServer(continous, done) {
  process.env.CLIENT_PATH = path.resolve(clientPath);

  var config = {
    configFile: `${__dirname}/${paths.karma}`,
    singleRun: !continous
  };

  var runTests = true;
  if(argv.browsers) {
    if(typeof argv.browsers === 'string' || argv.browsers instanceof String) {
      const noWhitespaces = argv.browsers.replace('\\s', '');
      const browsers = noWhitespaces.split(',')
        .map((ab) => {
          const fullBrowserName = SUPPORTED_BROWSERS
            .filter(fn => fn.toLowerCase().startsWith(ab.toLowerCase()))
            .find((el, idx, arr) => true); /* take any element*/

          if(fullBrowserName == undefined) {
            console.log("Unrecognized browser name prefix: " + ab);
          }

          return fullBrowserName;
        })
        .filter(s => s != undefined);

      if (browsers.length > 0) {
        console.log("Tests will be executed with the following browsers: " + browsers);

        config.browsers = browsers;
        config.detectBrowsers = {
          enabled: false
        };
      } else {
        console.log("No supported browsers found on the list, aborting");
        runTests = false;
      }
    } else {
      console.log('Browser list empty, aborting');
      runTests = false;
    }
  }

  if(runTests) new KarmaServer(config, done).start();
}

/********************
 * Build
 ********************/

gulp.task('build', cb => {
  runSequence(
    'clean:out',
    'copy:extras',
    'webpack:index',
    'webpack:app',
    cb);
});

gulp.task('build:prod', cb => {
  runSequence(
    'clean:out',
    'copy:extras',
    'webpack:index:prod',
    'webpack:app:prod',
    'lint:scripts:server',
    'transpile:server',
    cb);
});

gulp.task('clean:out', () => del([`${paths.out}/**`], {dot: true}));

gulp.task('copy:extras', () => {
    return gulp.src(paths.client.extras, { dot: true })
        .pipe(gulp.dest(clientOut));
});

function webpackBuilder(baseConfig, pathConfig) {
  return gulp.src(pathConfig.entrypoint)
    .pipe(webpackStream(webpackConf(baseConfig, pathConfig)))
    .pipe(gulp.dest(clientOut));
}


gulp.task('webpack:index', () => {
  return webpackBuilder(wpConf.dev, paths.client.index);
});

gulp.task('webpack:index:prod', () => {
  return webpackBuilder(wpConf.prod, paths.client.index);
});

gulp.task('webpack:app', () => {
  return webpackBuilder(wpConf.dev, paths.client.app);
});

gulp.task('webpack:app:prod', () => {
  return webpackBuilder(wpConf.prod, paths.client.app);
});

gulp.task('transpile:server', () => {
  return gulp.src(_.union(paths.server.scripts, paths.server.json))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel({
      plugins: ['transform-runtime']
    }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(serverOut));
});

gulp.task('coverage:pre', () => {
  return gulp.src(paths.server.scripts)
    // Covering files
    .pipe(plugins.istanbul({
        instrumenter: Instrumenter, // Use the isparta instrumenter (code coverage for ES6)
        includeUntested: true
    }))
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

gulp.task('coverage:unit', () => {
    return gulp.src(paths.server.test.unit)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('coverage:integration', () => {
    return gulp.src(paths.server.test.integration)
        .pipe(mocha())
        .pipe(istanbul())
        // Creating the reports after tests ran
});

gulp.task('mocha:coverage', cb => {
  runSequence('coverage:pre',
              'env:test',
              'coverage:unit',
              'coverage:integration',
              cb);
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

gulp.task('test:e2e', ['env:test', 'start:server', 'webdriver_update'], cb => {
    gulp.src(paths.client.e2e)
        .pipe(protractor({
            configFile: 'protractor.conf.js',
        })).on('error', err => {
            console.log(err)
        }).on('end', () => {
            process.exit();
        });
});

gulp.task('debug:webpackConf', cb => {
  console.log('=== APP DEVELOPMENT ===\n' + JSON.stringify(webpackConf(wpConf.dev, paths.client.app), null, 2));
  console.log('=== APP PRODUCTION ===\n' + JSON.stringify(webpackConf(wpConf.prod, paths.client.app), null, 2));
});
