'use strict';

/* SERVER CODE ENTRY POINT
 * How server's initialization progresses from now?
 * - app.js
 *   - config/environment/index.js
 *     index.js holds default values, which are merged with shared.js and environment
 *     specific file (development.js, production.js, test.js)
 *   - mongo connection creation
 *   - database seeding (only in dev)
 *   - config/express - middleware setup
 *     also sets up from where static assets are served
 *   - routes.js - endpoints registration
 *   - serverStart - only callbacks from now on
 * */

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/* in dev/test mode babel is used at runtime
 for production build, files must be transpiled */
if(env === 'development' || env === 'test') {
  require('babel-core/register');
}

// Export the application
exports = module.exports = require('./app');
