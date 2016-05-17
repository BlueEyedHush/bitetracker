import 'babel-polyfill';
import 'SHAREDJS/fetch-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login.jsx';
import * as Auth from 'SHAREDJS/auth';
import {ensureCookiesEnabled} from 'SHAREDJS/cookies';

require('./index.scss');

ensureCookiesEnabled(index);

function index() {
  if(Auth.isCookiePresent()) {
    window.location.href = Auth.getCachedRedirectionUrl();
  } else {
    ReactDOM.render(<Login />, document.getElementById('content'));
  }
}
