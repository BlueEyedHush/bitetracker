import React from 'react';

import './HelloWorld.scss';

export default React.createClass({
  render: function() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <img src ={require('../../images/recipes/default.png')}/>
      </div>
    );
  }
});
