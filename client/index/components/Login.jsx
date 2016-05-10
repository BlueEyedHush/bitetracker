import React from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import * as Auth from 'SHAREDJS/auth.js';

const ERROR_INCORRECT = 'incorrect';
const ERROR_UNKNOWN = 'unknown';
const SUCCESS = 'success';

const LoginErrorAlert = React.createClass({
   render() {
    if(this.props.errorType === ERROR_INCORRECT) {
      return (<Alert bsStyle="danger">Username or password is incorrect!</Alert>);
    } else if(this.props.errorType === ERROR_UNKNOWN) {
      return (<Alert bsStyle="danger">Unknown error occured. Please refresh the page and try again.</Alert>);
    } else {
      return null;
    }
  }
});

export default React.createClass({
  getInitialState() {
    return {
      username: '',
      password: '',
      status: SUCCESS
    };
  },

  render() {
    return (
      <form>
        <FormGroup controlId="login">
          <LoginErrorAlert errorType={this.state.status}/>
          <FormControl type="text"
                       value={this.state.username}
                       placeholder="Username"
                       onChange={this.usernameChanged}/>
          <FormControl type="password"
                       value={this.state.password}
                       placeholder="Password"
                        onChange={this.passwordChanged}/>
          <Button bsStyle="primary" onClick={this.submit}>Submit</Button>
        </FormGroup>
      </form>
    );
  },

  usernameChanged(e) {
    this.setState({ username: e.target.value });
  },

  passwordChanged(e) {
    this.setState({ password: e.target.value });
  },

  submit(e) {
    Auth.login(this.state.username, this.state.password)
      .then((redirUrl) => {
        window.location.href = redirUrl;
      })
      .catch((reason) => {
        if(reason.name === 'incorrect_credentials') {
          this.setState({status: ERROR_INCORRECT});
        } else if(reason.name === 'unknown') {
          console.log(reason.message);
          this.setState({status: ERROR_UNKNOWN});
        }
    });
  }
});
