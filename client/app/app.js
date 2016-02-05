'use strict';

angular.module('foodDiaryApp', [
  'foodDiaryApp.auth',
  'foodDiaryApp.admin',
  'foodDiaryApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'validation.match',
  'ui.materialize'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
