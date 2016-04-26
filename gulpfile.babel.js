'use strict';

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

import debug from 'gulp-debug'

var plugins = gulpLoadPlugins();

const out = 'build';
const clientPath = 'client';
const serverPath = 'server';
const clientOut = `${out}/client`;
const serverOut = `${out}/server`;

const paths = {
    client: {
        // what will be linted
        linting: [
            `${clientPath}/**/*.js`,
            `${clientPath}/**/*.jsx`
        ],
        webpackEntrypoint: `${clientPath}/app/app.jsx`,
        htmlTemplate: `${clientPath}/index.html`,
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

const webpackDevConf = {
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },{
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    },{
      test: /\.png$/,
      loader: "file-loader"
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: paths.client.htmlTemplate,
      inject: 'body'
    })
  ]
};

const webpackProdConf = {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },{
      test: /\.scss$/,
      loaders: ["style", "css", "sass"]
    },{
      test: /\.png$/,
      loader: "file-loader"
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: paths.client.htmlTemplate,
      inject: 'body'
    })
  ]
};

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
    console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
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

gulp.task('env', () => {
  plugins.env({
    vars: {NODE_ENV: 'development'}
  });
});
gulp.task('env:test', () => {
    plugins.env({
        vars: {NODE_ENV: 'test'}
    });
});
gulp.task('env:prod', () => {
    plugins.env({
        vars: {NODE_ENV: 'production'}
    });
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
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    process.env.CLIENT_ROOT = clientOut;
    process.env.SERVER_ROOT = serverOut;
    nodemon(`-w ${serverOut} ${serverOut}`)
        .on('log', onServerLog);
});

gulp.task('start:server', () => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.CLIENT_ROOT = clientOut;
    process.env.SERVER_ROOT = serverPath;
    nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

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
    return plugins.watch([`${clientPath}/**/*`, `!/**/*${intellijTempFileSuffix}`],{
        name: 'livereloadWatcher'
      }, () => {
      gulp.src(paths.client.webpackEntrypoint)
        .pipe(plumber())
        .pipe(webpackStream(webpackDevConf).on('error', function() {this.emit('end')}))
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

gulp.task('test:client', ['wiredep:test'], (done) => {
    new KarmaServer({
      configFile: `${__dirname}/${paths.karma}`,
      singleRun: true
    }, done).start();
});

gulp.task('wiredep:test', () => {
    return gulp.src(paths.karma)
        .pipe(wiredep({
            exclude: [
                /bootstrap-sass-official/,
                /bootstrap.js/,
                '/json3/',
                '/es5-shim/',
                /bootstrap.css/,
                /font-awesome.css/
            ],
            devDependencies: true
        }))
        .pipe(gulp.dest('./'));
});

/********************
 * Build
 ********************/

gulp.task('build', cb => {
  runSequence(
    'clean:out',
    'copy:extras',
    'client:webpack',
    cb);
});

gulp.task('build:prod', cb => {
  runSequence(
        'clean:out',
        'copy:extras',
        'client:webpack:prod',
        'lint:scripts:server',
        'transpile:server',
        cb);
});

gulp.task('clean:out', () => del([`${paths.out}/**`], {dot: true}));

gulp.task('copy:extras', () => {
    return gulp.src(paths.client.extras, { dot: true })
        .pipe(gulp.dest(clientOut));
});

gulp.task('client:webpack', () => {
  return gulp.src(paths.client.webpackEntrypoint)
    .pipe(webpackStream(webpackDevConf))
    .pipe(gulp.dest(clientOut));
});

gulp.task('client:webpack:prod', () => {
  return gulp.src(paths.client.webpackEntrypoint)
    .pipe(webpackStream(webpackProdConf))
    .pipe(gulp.dest(clientOut));
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
