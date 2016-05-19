
/* promises polyfill for babel */
import 'core-js/es6/promise';

/* even though we use fetch-mock, it relies on Request/Response classes, which must be
 * either provided by environment, or polyfilled */
import 'whatwg-fetch';
import fetchMock from 'fetch-mock';

import {login, EX as authEx, __RewireAPI__ as authRewire} from 'CLIENT_PATH/sharedjs/auth';
import cookies from 'js-cookie';

const TEST_RESPONSE_PAYLOAD = {userId: '123', redirectUrl: '/redirect.html'};
const CREDENTIALS = {username: 'test', password: 'pass'};


function removeCookies() {
  cookies.remove('user');
  cookies.remove('redirUrl');
}

let promise;
function setupWithRespone(response) {
  removeCookies();
  fetchMock.restore();
  fetchMock.mock(authRewire.__get__('LOCAL_AUTH_URL'), 'POST', response);
  promise = login(CREDENTIALS.username, CREDENTIALS.password);
}


describe('auth-test', () => {
  describe('http200', () => {
    before(() => setupWithRespone(TEST_RESPONSE_PAYLOAD));

    after(() => removeCookies());

    it('promise should resolve on HTTP 200', () => {
      return promise.should.be.fulfilled;
    });

    it('promise should be resolved with correct argument: [resp, json]', () => {
      return promise.should.be.fulfilled
        .and.eventually.have.keys('0', '1'); /* two-element array */
    });

    it('local auth service is called', () => {
      expect(fetchMock.called(authRewire.__get__('LOCAL_AUTH_URL'))).to.be.true;
    });

    it('correct credentials should be sent to login service', () => {
      expect(JSON.parse(fetchMock.lastOptions(authRewire.__get__('LOCAL_AUTH_URL')).body))
        .to.deep.equal(CREDENTIALS);
    });

    it('when promise resolves, "user" cookie should be set', () => {
      expect(cookies.get(authRewire.__get__('USERID_COOKIE_NAME')))
        .to.be.equal(TEST_RESPONSE_PAYLOAD.userId);
    });

    it('when promise resolves, "redirUrl" cookie should be set', () => {
      expect(cookies.get(authRewire.__get__('REDIRURL_COOKIE_NAME')))
        .to.be.equal(TEST_RESPONSE_PAYLOAD.redirectUrl);
    });
  });

  describe('http403', () => {
    before(() => setupWithRespone({status: 403, body: {message: 'any message'}}));

    it('promise should rejected on HTTP 403 with correct error type', () => {
      return promise.should.be.rejected
        .and.eventually.have.property('name', authEx.INCORRECT_CREDENTIALS);
    });
  });

  describe('http500', () => {
    before(() => setupWithRespone(500));

    it('promise should rejected on HTTP 500 with correct error type', () => {
      return promise.should.be.rejected
        .and.eventually.have.property('name', authEx.UNKNOWN);
    });
  });

  describe('http200 with malformed payload', () => {
    before(() => setupWithRespone('{abc'));

    it('when payload malformed, promise should rejected UNKNOWN error type', () => {
      return promise.should.be.rejected
        .and.eventually.have.property('name', authEx.UNKNOWN);
    });
  });
});
