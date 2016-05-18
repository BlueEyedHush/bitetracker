import React from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import {redirect} from 'SHAREDJS/redir';

const NOERROR = 'NOERROR';

const S_INCORRECT_CREDS = 'Username or password is incorrect!';
const S_UNKNOWN_ERROR = 'Unknown error occured. Please refresh the page and try again.';

const LoginErrorAlert = React.createClass({
   render() {
    if(this.props.errorType === 'INCORRECT_CREDENTIALS') {
      return (<Alert bsStyle="danger">{S_INCORRECT_CREDS}</Alert>);
    } else if(this.props.errorType === 'UNKNOWN') {
      return (<Alert bsStyle="danger">{S_UNKNOWN_ERROR}</Alert>);
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
      status: NOERROR
    };
  },

  render() {
    return (
      <form>
        <FormGroup>
          <LoginErrorAlert errorType={this.state.status}/>
          <FormControl id="usernameForm"
                       type="text"
                       value={this.state.username}
                       placeholder="Username"
                       onChange={this.usernameChanged}/>
          <FormControl id="passwordForm"
                       type="password"
                       value={this.state.password}
                       placeholder="Password"
                       onChange={this.passwordChanged}/>
          <Button id="submitButton" bsStyle="primary" onClick={this.submit}>Submit</Button>
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
    this.props.authService.login(this.state.username, this.state.password)
      .then(([_, json]) => {
        redirect(json.redirectUrl);
        /* usually this won't execute, but I add this for completness */
        this.setState({status: NOERROR})
      })
      .catch((reason) => {
        this.setState({status: reason.name});
    });
  }
});
