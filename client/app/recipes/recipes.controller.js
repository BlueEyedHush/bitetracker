'use strict';

(function() {

  class RecipesController {

    constructor($http, $scope, socket) {
      this.$http = $http;
      this.list = [];

      $http.get('/api/recipes').then(response => {
        this.list = response.data;
        socket.syncUpdates('recipe', this.list);
      });

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('recipe');
      });
    }
  }

  angular.module('foodDiaryApp')
      .controller('RecipesController', RecipesController);

})();
