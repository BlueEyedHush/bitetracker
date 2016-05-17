
/* promises polyfill for babel */
require('core-js/es6/promise');

require('whatwg-fetch');
const fetchMock = require('fetch-mock');
const Auth = require('CLIENT_PATH/sharedjs/auth');
const Cookies = require('js-cookie');

const LOCAL_AUTH_SERVICE_URL = '/auth/local';

const TEST_RESPONSE_PAYLOAD = {userId: '123', redirectUrl: '/redirect.html'};
const CREDENTIALS = {username: 'test', password: 'pass'};

var promise;

function setupWithRespone(response) {
  Cookies.remove('user');
  Cookies.remove('redirUrl');
  fetchMock.restore();
  fetchMock.mock(LOCAL_AUTH_SERVICE_URL, 'POST', response);
  promise = Auth.login(CREDENTIALS.username, CREDENTIALS.password);
}


describe('auth-test', function() {
  describe('http200', function() {
    before(() => setupWithRespone(TEST_RESPONSE_PAYLOAD));

    it('promise should resolve on HTTP 200', function() {
      return promise.should.be.fulfilled;
    });

    it('promise should be resolved with correct argument: [resp, json]', function() {
      return promise.should.be.fulfilled
        .and.eventually.have.keys('0', '1'); /* two-element array */
    });

    it('local auth service is called', function() {
      expect(fetchMock.called(LOCAL_AUTH_SERVICE_URL)).to.be.true;
    });

    it('correct credentials should be sent to login service', function() {
      expect(JSON.parse(fetchMock.lastOptions(LOCAL_AUTH_SERVICE_URL).body)).to.deep.equal(CREDENTIALS);
    });

    it('when promise resolves, "user" cookie should be set', function() {
      expect(Cookies.get('user')).to.be.equal(TEST_RESPONSE_PAYLOAD.userId);
    });

    it('when promise resolves, "redirUrl" cookie should be set', function() {
      expect(Cookies.get('redirUrl')).to.be.equal(TEST_RESPONSE_PAYLOAD.redirectUrl);
    });
  });

  describe('http403', function() {
    before(() => setupWithRespone({status: 403, body: {message: 'any message'}}));

    it('promise should rejected on HTTP 403 with correct error type', function() {
      return promise.should.be.rejected
        .and.eventually.have.property('name', Auth.EX.INCORRECT_CREDENTIALS);
    });
  });

  describe('http500', function() {
    before(() => setupWithRespone(500));

    it('promise should rejected on HTTP 500 with correct error type', function() {
      return promise.should.be.rejected
        .and.eventually.have.property('name', Auth.EX.UNKNOWN);
    });
  });

  describe('http200 with malformed payload', function() {
    before(() => setupWithRespone('{abc'));

    it('when payload malformed, promise should rejected UNKNOWN error type', function() {
      return promise.should.be.rejected
        .and.eventually.have.property('name', Auth.EX.UNKNOWN);
    });
  });
});
