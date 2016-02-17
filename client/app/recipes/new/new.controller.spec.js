'use strict';

describe('Controller: NewRecipeController', function () {

  // load the controller's module
  beforeEach(module('foodDiaryApp'));

  var RecipesNewCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RecipesNewCtrl = $controller('NewRecipeController', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    1.should.equal(1);
  });
});
