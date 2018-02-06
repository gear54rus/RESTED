import oauth1 from 'oauth-1.0a';
import { change } from 'redux-form';
import { call, apply, put, select, takeLatest } from 'redux-saga/effects';

import { authCollapsibleID } from 'components/Authentication';
import { expand } from 'store/config/actions';
import { requestForm } from 'components/Request';
import { getRequest } from 'store/request/selectors';
import { getUrl } from 'store/request/sagas';
import { apsGetAutoRefresh, apsGetTokenExpired } from 'store/auth/selectors';
import base64Encode from 'utils/base64';
import { BASIC_AUTH_HEADER, APS_TOKEN_HEADER } from 'constants/constants';
import { tokenTypes as apsTokenTypes, oaAPIURL } from 'utils/aps';
import { signatureMethods as oAuth1SignatureMethods } from 'utils/oauth1';

import {
  APS_BROWSER_DATA_RECEIVED,
  APS_TOKEN_REFRESH_START,
  APS_TOKEN_REFRESH_ERROR,
  APS_TOKEN_REFRESH_END,
} from './types';


function basicAuthTransform(fetchInput, { auth: { basic } }) {
  if (basic && basic.username) {
    fetchInput.headers.set(BASIC_AUTH_HEADER, `Basic ${base64Encode(`${basic.username}:${basic.password || ''}`)}`);
  }
}

function* apsFillTokenFromBrowser({ form }) {
  yield put(change(requestForm, 'url', form.url));
  yield put(change(requestForm, 'auth', form.auth));
  yield put(expand(authCollapsibleID));
}

function* apsGetAPIURL({ url }, request) {
  if (url) {
    return url.trim();
  }

  const requestUrl = yield call(getUrl, request);
  const apiURL = yield call(oaAPIURL, requestUrl);

  yield put(change(requestForm, 'auth.apsToken.api.url', apiURL));

  return apiURL;
}

function* apsGetTokenFromResponse(response) {
  if (response.status !== 200) {
    switch (response.status) {
      case 401:
        throw new Error('Authorization required');
      case 403:
        throw new Error('Wrong credentials supplied');
      default:
        throw new Error(`HTTP code ${response.status} received`);
    }
  }

  const body = yield apply(response, response.text);

  const matches = {
    token: /<member><name>aps_token<\/name><value><string>([^<]+)<\/string><\/value><\/member>/.exec(body),
    faultString: /<member><name>faultString<\/name><value><string>([^<]+)<\/string><\/value><\/member>/.exec(body),
    error: /<member><name>error_message<\/name><value><string>([^<]+)<\/string><\/value><\/member>/.exec(body),
  };

  let errorMessage;

  if (matches.token) return matches.token[1];
  if (matches.faultString) errorMessage = matches.faultString[1];
  if (matches.error) errorMessage = matches.error[1];

  if (errorMessage) {
    throw new Error(`OA API error: ${errorMessage}`);
  } else {
    throw new Error('Unable to parse OA API response');
  }
}

export function* apsTokenRefresh() {
  try {
    const request = yield select(getRequest);
    const apsValues = request.auth.apsToken || {};

    apsValues.api = Object.assign({
      url: '',
      username: '',
      password: '',
    }, apsValues.api);

    apsValues.token = Object.assign({
      value: '',
      type: Object.keys(apsTokenTypes)[0],
      params: [''],
    }, apsValues.token);

    const fetchInput = {
      method: 'POST',
      credentials: 'omit',
      redirect: 'error',
      headers: new Headers(),
      body: apsTokenTypes[apsValues.token.type].generator(...apsValues.token.params),
    };

    const url = yield call(apsGetAPIURL, apsValues.api, request);

    basicAuthTransform(fetchInput, { auth: { basic: apsValues.api } });

    const response = yield call(fetch, url, fetchInput);
    const token = yield call(apsGetTokenFromResponse, response);

    yield put(change(requestForm, 'auth.apsToken.token.value', token));

    yield put({
      type: APS_TOKEN_REFRESH_END,
      time: (new Date()).getTime(),
      value: token,
      tokenType: apsValues.token.type,
      params: apsValues.token.params,
      url,
    });
  } catch (error) {
    yield put({ type: APS_TOKEN_REFRESH_ERROR, error: error.message });
  }
}

function* apsTokenTransform({ headers }, { auth: { apsToken } }) {
  const tokenExpired = yield select(apsGetTokenExpired);
  const autoRefresh = yield select(apsGetAutoRefresh);

  if (tokenExpired && autoRefresh) {
    yield call(apsTokenRefresh);
  }

  if (apsToken && apsToken.token && apsToken.token.value) {
    headers.set(APS_TOKEN_HEADER, apsToken.token.value);
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
  yield takeLatest(APS_BROWSER_DATA_RECEIVED, apsFillTokenFromBrowser);
  yield takeLatest(APS_TOKEN_REFRESH_START, apsTokenRefresh);
}
