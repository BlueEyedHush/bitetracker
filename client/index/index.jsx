import 'babel-polyfill';
import 'SHAREDJS/fetch-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login.jsx';
import * as Auth from 'SHAREDJS/auth';

require('./index.scss');

if(Auth.isCookiePresent()) {
  window.location.href = Auth.getCachedRedirectionUrl();
} else {
  ReactDOM.render(<Login />, document.getElementById('content'));
}
