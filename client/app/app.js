'use strict';

angular.module('foodDiaryApp', [
  'foodDiaryApp.auth',
  'foodDiaryApp.admin',
  'foodDiaryApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'validation.match',
  'ui.bootstrap'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
