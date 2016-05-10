import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './components/HelloWorld.jsx';
import * as Auth from 'SHAREDJS/auth';

import './app.scss';

if(!Auth.isCookiePresent()) {
  window.location.href = '/';
} else {
  ReactDOM.render(<HelloWorld />, document.getElementById('content'));
}
