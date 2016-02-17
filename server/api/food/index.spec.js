'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var foodCtrlStub = {
  index: 'foodCtrl.index',
  show: 'foodCtrl.show',
  create: 'foodCtrl.create',
  update: 'foodCtrl.update',
  destroy: 'foodCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var foodIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './food.controller': foodCtrlStub
});

describe('Food API Router:', function() {

  it('should return an express router instance', function() {
    foodIndex.should.equal(routerStub);
  });

  describe('GET /api/foods', function() {

    it('should route to food.controller.index', function() {
      routerStub.get
        .withArgs('/', 'foodCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/foods/:id', function() {

    it('should route to food.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'foodCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/foods', function() {

    it('should route to food.controller.create', function() {
      routerStub.post
        .withArgs('/', 'foodCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/foods/:id', function() {

    it('should route to food.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'foodCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/foods/:id', function() {

    it('should route to food.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'foodCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/foods/:id', function() {

    it('should route to food.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'foodCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
