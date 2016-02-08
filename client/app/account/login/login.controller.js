'use strict';

class LoginController {
  constructor(Auth, $state) {
    this.user = {};
    this.errors = {};
    this.submitted = false;
    this.referrer = $state.params.referrer || $state.current.referrer || 'main';

    this.Auth = Auth;
    this.$state = $state;
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
      .then(() => {
        // Logged in, redirect to home
        this.$state.go(this.referrer);
      })
      .catch(err => {
        this.errors.other = err.message;
      });
    }
  }
}

angular.module('foodDiaryApp')
  .controller('LoginController', LoginController);
