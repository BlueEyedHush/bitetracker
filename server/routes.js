/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/foods', require('./api/food').default);
  app.use('/api/food_groups', require('./api/food/food_group').default);
  app.use('/api/recipes', require('./api/recipe').default);
  app.use('/api/things', require('./api/thing').default);
  app.use('/api/users', require('./api/user').default);

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
