'use strict';

// Register the Babel require hook
require('babel-register')({
  /* this will be merged with appropriate .babelrc file (and .babelrc has priority) 
  * however, babel-register doesn't respect 'only', so it must be specified again here*/
  only: /src\/node_modules/,
});

var chai = require('chai');

// Load Chai assertions
global.expect = chai.expect;
global.assert = chai.assert;
chai.should();

// Load Sinon
global.sinon = require('sinon');

// Initialize Chai plugins
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'));
