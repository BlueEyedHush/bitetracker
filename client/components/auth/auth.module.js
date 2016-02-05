'use strict';

angular.module('foodDiaryApp.auth', [
  'foodDiaryApp.constants',
  'foodDiaryApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
