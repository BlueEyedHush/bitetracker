import 'babel-polyfill';
import 'SHAREDJS/fetch-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login.jsx';
import * as auth from 'SHAREDJS/auth';
import {ensureCookiesEnabled} from 'SHAREDJS/cookies';

import './index.scss';

function index() {
  if(auth.isCookiePresent()) {
    window.location.href = auth.getCachedRedirectionUrl();
  } else {
    ReactDOM.render(<Login authService={auth} />, document.getElementById('content'));
  }
}

ensureCookiesEnabled(index);
