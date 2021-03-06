'use strict';

const path = require('path');
const _ = require('lodash');
const del = require('del');

const gulp = require('gulp');
const lazypipe = require('lazypipe');
const runSequence = require('run-sequence');
const plumber = require('gulp-plumber');
const yargs = require('yargs');

const webpackStream = require('webpack-stream');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const wpConf = require('./webpack.dconf');

const nodemon = require('nodemon');
const KarmaServer = require('karma').Server;
const Protractor = require('gulp-protractor');
const protractor = Protractor.protractor;
const webdriver_update = Protractor.webdriver_update;
const Instrumenter = require('isparta').Instrumenter;

const argv = yargs
  .alias('b', 'browsers')
  .alias('s', 'source')
  .alias('t', 'target')
  .argv;

var plugins = require('gulp-load-plugins')({
  camelize: true,
});

const out = 'build/node_modules';
const srcDir = 'src/node_modules';
const clientPath = `${srcDir}/client`;
const serverPath = `${srcDir}/server`;
const clientTestPath = `${srcDir}/tests/client`;
const serverTestPath = `${srcDir}/tests/server`;
const clientOut = `${out}/client`;
const serverOut = `${out}/server`;
const indexDir = `${clientPath}/index`;
const appDir = `${clientPath}/app`;

const paths = {
  client: {
    // what will be linted
    scripts: [
      `${clientPath}/**/*.js`,
      `${clientPath}/**/*.jsx`,
    ],
    test: [
      `${clientTestPath}/**/*.js`,
      `${clientTestPath}/**/*.jsx`,
    ],
    sharedJs: `${clientPath}/sharedjs`,
    index: {
      entrypoint: `${indexDir}/index.jsx`,
      htmlTemplate: `${clientPath}/template.html`,
      outputPageName: 'index.html'
    },
    app: {
      entrypoint: `${appDir}/app.jsx`,
      htmlTemplate: `${clientPath}/template.html`,
      outputPageName: 'app.html'
    },
    e2e: ['e2e/**/*.spec.js'],
    // copied to client directory without processing
    extras: [
      `${clientPath}/favicon.ico`,
      `${clientPath}/robots.txt`,
      `${clientPath}/.htaccess`
    ]
  },
  server: {
    scripts: [`${serverPath}/**/*.js`],
    json: [`${serverPath}/**/*.json`],
    test: {
      initializer: `${serverTestPath}/mocha.initializer.js`,
      integration: `${serverTestPath}/integration/**/*.integration.js`,
      unit: `${serverTestPath}/unit/**/*.spec.js`,
      finalizer: `${serverTestPath}/mocha.finalizer.js`,
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

let lintScripts = lazypipe()
  .pipe(plugins.eslint)
  .pipe(plugins.eslint.format);

function mocha(port) {
  port = port || 9001;

  return lazypipe().pipe(plugins.spawnMocha, {
    env: {
      PORT: port,
    },
    reporter: 'spec',
    timeout: 5000,
    ui: 'bdd-lazy-var/global',
    require: [
      paths.server.test.initializer
    ]
  });
}

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
    rootDirectory: ''
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

gulp.task('env:dist', () => {
  commonConfig();
  process.env.SERVER_ROOT = serverOut;
  process.env.NODE_ENV = 'production';
});

/********************
 * Tasks
 ********************/

gulp.task('lint:client', () => {
  return gulp.src(paths.client.scripts)
    .pipe(lintScripts());
});

gulp.task('lint:clienttests', () => {
  return gulp.src(paths.client.test)
    .pipe(lintScripts());
});

gulp.task('lint:server', () => {
  return gulp.src(paths.server.scripts)
    .pipe(lintScripts());
});

gulp.task('lint:servertests', () => {
  return gulp.src([paths.server.test.unit, paths.server.test.integration, paths.server.test.finalizer])
    .pipe(lintScripts());
});

gulp.task('lint', ['lint:client', 'lint:clienttests', 'lint:server', 'lint:servertests']);

function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
    plugins.util.colors.yellow('nodemon') +
    plugins.util.colors.white('] ') +
    log.message);
}

gulp.task('start:server:dist', () => {
  nodemon({script: serverOut, watch: false}).on('log', onServerLog);
});

gulp.task('start:server', () => {
  nodemon({script: serverPath, watch: serverPath}).on('log', onServerLog);
});

gulp.task('start', cb => {
  runSequence(
    'env',
    'start:server',
    cb);
});

gulp.task('start:dist', cb => {
  runSequence(
    'env:dist',
    'start:server:dist',
    cb);
});

gulp.task('serve', cb => {
  runSequence(
    'build',
    'start',
    'watch',
    cb);
});

gulp.task('serve:dist', cb => {
  runSequence(
    'build:dist',
    'start:dist',
    cb);
});

gulp.task('watch', () => {
  plugins.livereload.listen();

  const intellijTempFileSuffix = '___jb_tmp___';
  const webpackDevIndex = webpackConf(wpConf.dev, paths.client.index);
  const webpackDevApp = webpackConf(wpConf.dev, paths.client.app);

  plugins.watch([`${appDir}/**/*`, paths.client.app.htmlTemplate,
    `!/**/*${intellijTempFileSuffix}`, `${paths.client.sharedJs}/**/*`], {
    name: 'AppWatcher'
  }, () => {
    gulp.src(paths.client.app.entrypoint)
      .pipe(plumber())
      .pipe(webpackStream(webpackDevApp).on('error', function () {
        this.emit('end')
      }))
      .pipe(gulp.dest(clientOut))
      .pipe(plugins.livereload());
  });

  return plugins.watch([`${indexDir}/**/*`, paths.client.index.htmlTemplate,
    `!/**/*${intellijTempFileSuffix}`, `${paths.client.sharedJs}/**/*`], {
    name: 'IndexWatcher'
  }, () => {
    gulp.src(paths.client.index.entrypoint)
      .pipe(plumber())
      .pipe(webpackStream(webpackDevIndex).on('error', function () {
        this.emit('end')
      }))
      .pipe(gulp.dest(clientOut))
      .pipe(plugins.livereload());
  });
});

gulp.task('test', cb => {
  return runSequence('test:server', 'test:client', cb);
});

gulp.task('test:server', cb => {
  runSequence(
    'mocha:unit',
    'mocha:integration',
    cb);
});

gulp.task('mocha:unit', ['env:test'], () => {
  return gulp.src(paths.server.test.unit)
    .pipe(mocha(9001)());
});

gulp.task('mocha:integration', ['env:test'], () => {
  return gulp.src([paths.server.test.integration, paths.server.test.finalizer], {base: serverTestPath})
    .pipe(mocha(9002)());
});

gulp.task('test:client', (done) => {
  startKarmaServer(false, done);
});

gulp.task('test:client:cont', (done) => {
  startKarmaServer(true, done);
});

const SUPPORTED_BROWSERS = ['IE', 'Firefox', 'Chrome', 'Opera', 'Safari', 'PhantomJS'];

function startKarmaServer(continous, done) {
  var config = {
    configFile: `${__dirname}/${paths.karma}`,
    singleRun: !continous
  };

  var runTests = true;
  if (argv.browsers) {
    if (typeof argv.browsers === 'string' || argv.browsers instanceof String) {
      const noWhitespaces = argv.browsers.replace('\\s', '');
      const browsers = noWhitespaces.split(',')
        .map((ab) => {
          const fullBrowserName = SUPPORTED_BROWSERS
            .filter(fn => fn.toLowerCase().startsWith(ab.toLowerCase()))
            .find((el, idx, arr) => true);
          /* take any element*/

          if (fullBrowserName == undefined) {
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

  if (runTests) new KarmaServer(config, done).start();
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

gulp.task('build:dist', cb => {
  runSequence(
    'clean:out',
    'copy:extras',
    'webpack:index:dist',
    'webpack:app:dist',
    'transpile:server',
    cb);
});

gulp.task('clean:out', () => del([`${out}/**/*`], {dot: true}));

gulp.task('clean:lintrubbish', () => del(['./**/*_scsslint_tmp*', '!./node_modules/**/*'], {dot: true}));

gulp.task('copy:extras', () => {
  return gulp.src(paths.client.extras, {dot: true})
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

gulp.task('webpack:index:dist', () => {
  return webpackBuilder(wpConf.prod, paths.client.index);
});

gulp.task('webpack:app', () => {
  return webpackBuilder(wpConf.dev, paths.client.app);
});

gulp.task('webpack:app:dist', () => {
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
    .pipe(istanbul());
  // Creating the reports after tests ran
});

gulp.task('coverage:integration', () => {
  return gulp.src(paths.server.test.integration)
    .pipe(mocha())
    .pipe(istanbul());
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

gulp.task('debug:webpack', () => {
  const conf = {
    entrypoint: argv.source,
    htmlTemplate: `${clientPath}/template.html`,
    outputPageName: 'debug.html'
  };

  return gulp.src(conf.entrypoint)
      .pipe(webpackStream(webpackConf(wpConf.dev, conf)))
      .pipe(gulp.dest(argv.target));
});
