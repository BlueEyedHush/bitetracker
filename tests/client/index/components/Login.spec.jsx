
import React from 'react';
import {mount} from 'enzyme';
import Login, {__RewireAPI__ as loginRewire} from 'CLIENT_PATH/index/components/Login.jsx';
import {createException as ex} from 'SHAREDJS/exceptions';
import chaiEnzymeInitialier from 'chai-enzyme';

chai.use(chaiEnzymeInitialier());

const REDIR_URL = '/redir.html';
function mockSuccessfullResponse() {
  const body = {userId: '123', redirectUrl: REDIR_URL};
  const response = new Response(JSON.stringify(body), {status: 200});
  return [response, body];
}

describe('<Login />', () => {
  let authSpy;
  let redirectSpy;
  before(() => {
    authSpy = {login: sinon.stub()};
    redirectSpy = sinon.spy();
    loginRewire.__Rewire__('redirect', redirectSpy);
  });

  it('component contains submit button', () => {
    const wrapper = mount(<Login authService={authSpy} />);
    expect(wrapper).to.have.descendants('#submitButton');
  });

  it('component contains username form', () => {
    const wrapper = mount(<Login authService={authSpy} />);
    expect(wrapper).to.have.descendants('#usernameForm');
  });

  it('component contains password form', () => {
    const wrapper = mount(<Login authService={authSpy} />);
    expect(wrapper).to.have.descendants('#passwordForm');
  });

  it('correct credentials should be passed to auth module', () => {
    authSpy.login.reset();
    const wrapper = mount(<Login authService={authSpy} />);
    authSpy.login.returns(Promise.reject(new Error('error')));

    wrapper.find('#usernameForm').get(0).value = 'username';
    wrapper.find('#usernameForm').simulate('change');
    wrapper.find('#passwordForm').get(0).value = 'password';
    wrapper.find('#passwordForm').simulate('change');
    wrapper.find('#submitButton').simulate('click');

    expect(authSpy.login.args[0]).to.be.deep.equal(['username', 'password']);
  });

  it('should redirect on success', (done) => {
    authSpy.login.reset();
    redirectSpy.reset();

    const wrapper = mount(<Login authService={authSpy} />);
    authSpy.login.returns(Promise.resolve(mockSuccessfullResponse()));

    wrapper.find('#submitButton').simulate('click');

    setTimeout(() => {
      expect(redirectSpy.calledOnce).to.be.true;
      done();
    });
  });

  it('on INCORRECT_CREDENTIALS error correct alert should appear', (done) => {
    authSpy.login.reset();
    const wrapper = mount(<Login authService={authSpy} />);
    authSpy.login.returns(Promise.reject(ex('INCORRECT_CREDENTIALS', '')));

    wrapper.find('#submitButton').simulate('click');

    setTimeout(() => {
      expect(wrapper.text()).to.contain(loginRewire.__get__('S_INCORRECT_CREDS'));
      done();
    }, 0);
  });

  it('on UNKNOWN error correct alert should appear', (done) => {
    authSpy.login.reset();
    const wrapper = mount(<Login authService={authSpy} />);
    authSpy.login.returns(Promise.reject(ex('UNKNOWN', '')));

    wrapper.find('#submitButton').simulate('click');

    setTimeout(() => {
      expect(wrapper.text()).to.contain(loginRewire.__get__('S_UNKNOWN_ERROR'));
      done();
    }, 0);
  });
});
