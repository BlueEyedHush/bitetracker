'use strict';

(function() {

  class NewRecipeController {

    constructor($http) {
      this.$http = $http;

      $http.get('/api/food_groups')
        .then(response => this.groups = response.data.list.item);
      $http.get('/api/foods?offset=1000')
        .then(response => {
          this.foods = response.data.list.item;
          //this.foods.forEach((food, i) => {
          //  this.foods[i].group = this.getGroup(food);
          //})
        });
      this.private = false;
      this.ingredients = [{}];
    }

    getGroup(food) {
      return this.$http.get('/api/foods/' + food.id)
        .then(response => {
          return response.data.report.food.group;
        });
    }
  }

  angular.module('foodDiaryApp')
    .controller('NewRecipeController', NewRecipeController);

})();
