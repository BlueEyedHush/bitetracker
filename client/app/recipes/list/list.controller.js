'use strict';

(function() {

  class RecipeListController {

    constructor($state, $stateParams, $http, $scope, socket) {
      this.$state = $state;
      this.$http = $http;
      this.list = [];

      $http.get('/api/recipes/' + ($stateParams.user || '')).then(response => {
        this.list = response.data;
        socket.syncUpdates('recipe', this.list);
      });

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('recipe');
      });
    }

    displayRecipe(recipe) {
      this.$state.go('recipes.recipe', {
        user: recipe.author,
        title: recipe.title
      });
    }
  }

  angular.module('foodDiaryApp')
      .controller('RecipeListController', RecipeListController);

})();