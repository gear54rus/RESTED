import { change } from 'redux-form';
import { call, apply, put, select, takeLatest } from 'redux-saga/effects';

import { authCollapsibleID } from 'components/Authentication';
import { expand } from 'store/config/actions';
import { requestForm } from 'components/Request';
import { getRequest } from 'store/request/selectors';
import { getUrl } from 'store/request/sagas';
import { APS_TOKEN_HEADER } from 'constants/constants';
import { prependHttp } from 'utils/request';
import { tokenTypes, oaAPIURL } from 'utils/aps';
import { basicAuthTransform } from 'store/auth/sagas';

import { getAutoRefresh, getTokenExpired } from './selectors';
import {
  BROWSER_DATA_RECEIVED,
  TOKEN_REFRESH_START,
  TOKEN_REFRESH_ERROR,
  TOKEN_REFRESH_END,
} from './types';

function* fillTokenFromBrowser({ form }) {
  yield put(change(requestForm, 'url', form.url));
  yield put(change(requestForm, 'auth', form.auth));
  yield put(expand(authCollapsibleID));
}

function* changeAPIURL(url) {
  return yield put(change(requestForm, 'auth.apsToken.api.url', url));
}

function* getAPIURL(api, request) {
  let url = String(api.url || '').trim();

  /* eslint-disable no-new, no-empty */
  try {
    new URL(url); // check URL validity

    if (url !== api.url) {
      yield changeAPIURL(url);
    }

    return url;
  } catch (e) {}

  url = prependHttp(url);

  try {
    new URL(url);

    yield changeAPIURL(url);

    return url;
  } catch (e) {}
  /* eslint-disable no-new, no-empty */

  url = oaAPIURL(yield call(getUrl, request));

  yield changeAPIURL(url);

  return url;
}

function* getTokenFromResponse(response) {
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
  if (matches.faultString) [, errorMessage] = matches.faultString;
  if (matches.error) [, errorMessage] = matches.error;

  if (errorMessage) {
    throw new Error(`OA API error: ${errorMessage}`);
  } else {
    throw new Error('Unable to parse OA API response');
  }
}

export function* tokenRefresh() {
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
      type: Object.keys(tokenTypes)[0],
      params: [''],
    }, apsValues.token);

    const fetchInput = {
      method: 'POST',
      credentials: 'omit',
      redirect: 'error',
      headers: new Headers(),
      body: tokenTypes[apsValues.token.type].generator(...apsValues.token.params),
    };

    const url = yield call(getAPIURL, apsValues.api, request);

    basicAuthTransform(fetchInput, { auth: { basic: apsValues.api } });

    const response = yield call(fetch, url, fetchInput);
    const token = yield call(getTokenFromResponse, response);

    yield put(change(requestForm, 'auth.apsToken.token.value', token));

    yield put({
      type: TOKEN_REFRESH_END,
      time: (new Date()).getTime(),
      value: token,
      tokenType: apsValues.token.type,
      params: apsValues.token.params,
      url,
    });

    return token;
  } catch (error) {
    yield put({ type: TOKEN_REFRESH_ERROR, error: error.message });
  }

  return undefined;
}

export function* transform({ headers }, { auth: { apsToken } }) {
  const tokenExpired = yield select(getTokenExpired);
  const autoRefresh = yield select(getAutoRefresh);

  let token = apsToken && apsToken.token && apsToken.token.value;

  if (tokenExpired && autoRefresh) {
    token = yield call(tokenRefresh);
  }

  if (token) {
    headers.set(APS_TOKEN_HEADER, token);
  }
}

export default function* rootSaga() {
  yield takeLatest(BROWSER_DATA_RECEIVED, fillTokenFromBrowser);
  yield takeLatest(TOKEN_REFRESH_START, tokenRefresh);
}
