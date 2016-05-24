'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var foodGroupCtrlStub = {
  index: 'foodGroupCtrl.index',
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy(),
};

// require the index with our stubbed out modules
var foodGroupIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    },
  },
  './food_group.controller': foodGroupCtrlStub,
}).default;

describe('FoodGroup API Router:', function() {

  it('should return an express router instance', function() {
    foodGroupIndex.should.equal(routerStub);
  });

  describe('GET /api/food_groups', function() {

    it('should route to foodGroup.controller.index', function() {
      routerStub.get
        .withArgs('/', 'foodGroupCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
