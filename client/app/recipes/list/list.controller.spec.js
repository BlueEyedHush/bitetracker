'use strict';

describe('Controller: RecipesListCtrl', function () {

  // load the controller's module
  beforeEach(module('foodDiaryApp'));

  var RecipesListCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RecipesListCtrl = $controller('RecipesListCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    1.should.equal(1);
  });
});
