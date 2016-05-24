/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/foods              ->  index
 * POST    /api/foods              ->  create
 * GET     /api/foods/:id          ->  show
 * PUT     /api/foods/:id          ->  update
 * DELETE  /api/foods/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import config from '../../config/environment';
var request = require('request-promise').defaults({
  baseUrl: config.ndb.baseUrl,
});
var qs = {api_key: config.ndb.apiKey};

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function onSuccess(entity) {
    if(entity) {
      res.status(statusCode).json(JSON.parse(entity));
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Foods
export function index(req, res) {
  request.get({
    url: '/list',
    qs: _.merge(qs, {
      lt: 'f',
      max: req.query.max || 50,
      offset: req.query.offset || 0,
    }),
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function show(req, res) {
  request.get({
    url: '/reports',
    qs: _.merge(qs, {
      ndbno: req.params.id,
    }),
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
