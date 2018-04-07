import oauth1 from 'oauth-1.0a';
import { fork } from 'redux-saga/effects';

import base64Encode from 'utils/base64';
import { BASIC_AUTH_HEADER } from 'constants/constants';
import { signatureMethods as oAuth1SignatureMethods } from 'utils/oauth1';

import apsTokenSaga, { transform as apsTokenTransform } from './apsToken/sagas';

export function basicAuthTransform(fetchInput, { auth: { basic } }) {
  if (basic && basic.username) {
    fetchInput.headers.set(BASIC_AUTH_HEADER, `Basic ${base64Encode(`${basic.username}:${basic.password || ''}`)}`);
  }
}

function oAuth1Transform({ url, method, headers }, fields) {
  let oAuthValues = fields.auth.oauth1 || {};

  oAuthValues.consumer = Object.assign({
    key: '',
    secret: '',
  }, oAuthValues.consumer);

  oAuthValues.token = Object.assign({
    key: '',
    secret: '',
  }, oAuthValues.token);

  oAuthValues = Object.assign({
    signatureMethod: Object.keys(oAuth1SignatureMethods)[0],
    timestamp: '',
    nonce: '',
    version: '1.0',
    realm: '',
  }, oAuthValues);

  const init = {
    consumer: { ...oAuthValues.consumer },
    signature_method: oAuthValues.signatureMethod.toUpperCase(),
    hash_function: oAuth1SignatureMethods[oAuthValues.signatureMethod].hashFunction,
    version: oAuthValues.version,
  };

  if (oAuthValues.realm) {
    init.realm = oAuthValues.realm;
  }

  const oauth = oauth1(init);
  const options = { url, method, data: {} };
  let token = {};

  ['timestamp', 'nonce'].forEach(name => {
    if (oAuthValues[name]) {
      options.data[`oauth_${name}`] = oAuthValues[name];
    }
  });

  if (oAuthValues.token.key) {
    ({ token } = oAuthValues);
  }

  const oAuthData = oauth.authorize(options, token);
  const toHeader = {};

  // Authorize spits out everything for some reason, need to filter:
  // https://github.com/ddo/oauth-1.0a/issues/70
  [
    'consumer_key',
    'token',
    'nonce',
    'timestamp',
    'signature',
    'signature_method',
    'version',
  ].forEach(key => {
    const actualKey = `oauth_${key}`;

    if (actualKey in oAuthData) {
      toHeader[actualKey] = oAuthData[actualKey];
    }
  });

  headers.set(
    BASIC_AUTH_HEADER,
    Object.values(oauth.toHeader(toHeader))[0],
  );
}

export const authTypes = {
  disabled: { caption: 'Disabled', transform() {} },
  basic: { caption: 'Basic', transform: basicAuthTransform },
  apsToken: { caption: 'APS Token', transform: apsTokenTransform },
  oauth1: { caption: 'OAuth 1.0a', transform: oAuth1Transform },
};

export default function* rootSaga() {
  yield fork(apsTokenSaga);
}
