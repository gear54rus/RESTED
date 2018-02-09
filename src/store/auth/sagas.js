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
  const oAuthValues = fields.auth.oauth1 || {};

  oAuthValues.consumer = Object.assign({
    key: '',
    secret: '',
  }, oAuthValues.consumer);

  oAuthValues.signatureMethod = oAuthValues.signatureMethod
    || Object.keys(oAuth1SignatureMethods)[0];

  const oauth = oauth1({
    consumer: { ...oAuthValues.consumer },
    signature_method: oAuthValues.signatureMethod.toUpperCase(),
    hash_function: oAuth1SignatureMethods[oAuthValues.signatureMethod].hashFunction,
  });

  headers.set(BASIC_AUTH_HEADER, Object.values(oauth.toHeader(oauth.authorize({
    url,
    method,
  })))[0]);
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
