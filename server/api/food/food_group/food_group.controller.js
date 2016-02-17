/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/food_groups              ->  index
 * POST    /api/food_groups              ->  create
 * GET     /api/food_groups/:id          ->  show
 * PUT     /api/food_groups/:id          ->  update
 * DELETE  /api/food_groups/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import config from '../../../config/environment';

var request = require('request-promise').defaults({
  baseUrl: config.ndb.baseUrl
});
var qs = { api_key: config.ndb.apiKey };

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(JSON.parse(entity));
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of FoodGroups
export function index(req, res) {
  request.get({
      url: '/list',
      qs: _.merge(qs, { lt: 'g' })
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}