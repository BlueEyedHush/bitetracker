'use strict';

angular.module('foodDiaryApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('recipes', {
        url: '/recipes',
        template: '<div ui-view />'
      })
      .state('recipes.list', {
        url: '/:user',
        templateUrl: 'app/recipes/list/list.html',
        controller: 'RecipeListController',
        controllerAs: 'vm'
      })
      .state('recipes.recipe', {
        url: '/:user/:title',
        templateUrl: 'app/recipes/recipe/recipe.html',
        controller: 'RecipeController',
        controllerAs: 'vm'
      })
      .state('recipes.new', {
        url: '/new',
        templateUrl: 'app/recipes/new/new.html',
        controller: 'NewRecipeController',
        controllerAs: 'vm',
        authenticate: true
      });
  });
