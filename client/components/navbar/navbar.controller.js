'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    title: 'Home',
    state: 'main'
  }];
  userMenu = [{
    title: 'Recipes',
    state: 'recipes.list'
  }, {
    title: 'Add Recipe',
    state: 'recipes.new'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('foodDiaryApp')
  .controller('NavbarController', NavbarController);
