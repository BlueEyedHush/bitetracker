'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var recipeCtrlStub = {
  index: 'recipeCtrl.index',
  show: 'recipeCtrl.show',
  create: 'recipeCtrl.create',
  update: 'recipeCtrl.update',
  destroy: 'recipeCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return 'authService.hasRole.' + role;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var recipeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './recipe.controller': recipeCtrlStub,
  '../../auth/auth.service': authServiceStub
}).default;

describe('Recipe API Router:', function() {

  it('should return an express router instance', function() {
    recipeIndex.should.equal(routerStub);
  });

  describe('GET /api/recipes', function() {

    it('should route to recipe.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'recipeCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/recipes/:id', function() {

    it('should route to recipe.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'recipeCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/recipes', function() {

    it('should route to recipe.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'recipeCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/recipes/:id', function() {

    it('should route to recipe.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'recipeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/recipes/:id', function() {

    it('should route to recipe.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'authService.isAuthenticated', 'recipeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/recipes/:id', function() {

    it('should route to recipe.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'recipeCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
