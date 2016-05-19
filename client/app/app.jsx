import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './components/HelloWorld.jsx';
import * as auth from 'SHAREDJS/auth';
import {ensureCookiesEnabled} from 'SHAREDJS/cookies';

import './app.scss';

function app() {
  if(!auth.isCookiePresent()) {
    window.location.href = '/';
  } else {
    ReactDOM.render(<HelloWorld />, document.getElementById('content'));
  }
}

ensureCookiesEnabled(app);
