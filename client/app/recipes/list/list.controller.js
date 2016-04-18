'use strict';

(function() {

  class RecipeListController {

    constructor($state, $stateParams, $http) {
      this.$state = $state;
      this.$http = $http;
      this.list = [];

      $http.get('/api/recipes/' + ($stateParams.user || '')).then(response => {
        this.list = response.data;
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
