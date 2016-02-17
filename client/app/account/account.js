'use strict';

angular.module('foodDiaryApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login?referrer',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('logout', {
        url: '/logout?referrer',
        referrer: 'main',
        template: '',
        controller: function($state, Auth) {
          var referrer = $state.params.referrer ||
                          $state.current.referrer ||
                          'main';
          Auth.logout();
          $state.go(referrer);
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupController',
        controllerAs: 'vm'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        authenticate: true
      });
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .run(function ($rootScope, $state, Auth) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (next.authenticate) {
        Auth.isLoggedIn(function (loggedIn) {
          if (!loggedIn) {
            $state.go('login', {referrer: next.name});
            event.preventDefault();
          }
        });
      }
    });
  });