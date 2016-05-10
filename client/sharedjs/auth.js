
import Cookies from './cookies';

const LOCAL_AUTH_URL = '/auth/local';
/**
 * Attempts to contact login service.
 * Service is expected to return 200 with reponse {redirectUrl: <rootRelativeUrl>} or 403
 *
 * @param {String} username
 * @param {String} passwd - plaintest passowrd
 * @returns {Promise} resolve(url to redirect to), reject(Error(reason for failure))
 * Error type (err.name):
 * * unauthenticated
 * * unknown
 */

export function login(username, passwd) {
  return fetch(LOCAL_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: passwd
      })
    })
    .then(response => {
      const json = response.json();
      console.log(json);

      if(response.status == 200) {
        return json;
      } else {
        const errorDesc = json.message;
        var err;
        if(response.status == 403) {
          err = new Error('[' + 403 + ']: ' + errorDesc);
          err.name = 'incorrect_credentials';
        } else {
          err = new Error('[' + request.status + ']: ' + errorDesc);
          err.name = 'unknown';
        }
        throw err;
      }
    })
    .catch(ex => {
      const err = new Error('Unknown error: ' + ex.message);
      err.name = 'unknown';
      throw err;
    })
    .then(json => {
      Cookies.setItem('user', json.userId, Infinity);
      Cookies.setItem('redirUrl', json.redirectUrl, Infinity);
    });
}

/**
 * Checks whether 'user' cookie is present and non-empty, returning either true or false
 */
export function isCookiePresent() {
  const cookie = Cookies.getItem('user');
  return cookie != null && cookie != '';
}

export function getCachedRedirectionUrl() {
  return Cookies.getItem('redirUrl');
}
