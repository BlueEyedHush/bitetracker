'use strict';

(function() {

  class RecipeController {

    constructor($stateParams, $http) {
      this.user = $stateParams.user;
      this.title = $stateParams.title;

      $http.get(`/api/recipes/${this.user}/${this.title}`).then(response => {
          this.recipe = response.data;
      });
    }

  }

  angular.module('foodDiaryApp')
      .controller('RecipeController', RecipeController);

})();
