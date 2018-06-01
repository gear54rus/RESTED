import Immutable from 'immutable';
import { initialize, change } from 'redux-form';
import { call, apply, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import clipboard from 'clipboard-polyfill';

import buildRequestData from 'utils/buildRequestData';
import { setLocationHash, focusUrlField, prependHttp, mapParameters, reMapHeaders, requestID } from 'utils/request';
import { pushHistory } from 'store/history/actions';
import { getUrlVariables } from 'store/urlVariables/selectors';
import { requestForm } from 'components/Request';
import { collapsibleID as headersCollapsibleID } from 'components/Request/HeadersField';
import { collapsibleID as authCollapsibleID } from 'components/Authentication';
import { collapsibleID as bodyCollapsibleID } from 'components/Request/BodyField';
import { updateOption } from 'store/options/actions';
import { expand } from 'store/config/actions';
import { getIgnoreCache } from 'store/options/selectors';
import { authTypes } from 'store/auth/sagas';
import fetchToCurl from 'utils/fetchToCurl';
import { getCollections } from 'store/collections/selectors';
import { getHistory } from 'store/history/selectors';
import { DEFAULT_REQUEST, PAGE_TITLE } from 'constants/constants';

import { getRequest, getPlaceholderUrl, getHeaders } from './selectors';
import { executeRequest, receiveResponse } from './actions';
import {
  SEND_REQUEST,
  REQUEST_FAILED,
  CHANGE_BODY_TYPE,
  COPY_CURL,
  FIND_SELECT_REQUEST,
  SELECT_REQUEST,
} from './types';

export function* getMethod({ method }) {
  const result = method || DEFAULT_REQUEST.method;

  if (result !== method) {
    yield put(change(requestForm, 'method', result));
  }

  return result;
}

export function* getUrl({ url: requestURL }) {
  let url = String(requestURL || '').trim();

  /* eslint-disable no-new, no-empty */
  try {
    new URL(url); // check URL validity

    if (url !== requestURL) {
      yield put(change(requestForm, 'url', url));
    }

    return url;
  } catch (e) {}

  url = prependHttp(url);

  try {
    new URL(url);

    yield put(change(requestForm, 'url', url));

    return url;
  } catch (e) {}
  /* eslint-disable no-new, no-empty */

  url = yield select(getPlaceholderUrl);

  yield put(change(requestForm, 'url', url));

  return url;
}
/* eslint-enable no-new, no-empty */

export function* getParameters() {
  let parameters = yield select(getUrlVariables);
  parameters = parameters.reduce((prev, parameter) => ({
    ...prev,
    [parameter.get('name')]: parameter.get('value'),
  }), {});

  return parameters;
}

export function* createResource(request) {
  const url = yield call(getUrl, request);
  const parameters = yield call(getParameters);

  return mapParameters(url, parameters);
}

function* buildHeaders({ headers }) {
  const parameters = yield call(getParameters);
  const requestHeaders = new Headers(reMapHeaders(headers, parameters));

  return requestHeaders;
}

// Needed for unit tests to be consistent
export function getBeforeTime() {
  return Date.now();
}

// Needed for unit tests to be consistent
export function getMillisPassed(before) {
  return Date.now() - before;
}

function buildResponseHeaders(response) {
  const headers = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const header of response.headers) {
    headers.push({
      name: header[0],
      value: header[1],
    });
  }

  return headers;
}

export function* addAuth(fetchInput, fields) {
  const { type } = fields.auth;

  if (type in authTypes) {
    yield call(authTypes[type].transform, fetchInput, fields);
  }
}

export function* normalize(request) {
  const method = yield call(getMethod, request);
  const url = yield call(createResource, request);
  const headers = yield call(buildHeaders, request);

  let body;
  if (!['GET', 'HEAD'].includes(method)) {
    body = request.bodyType !== 'custom'
      ? buildRequestData(request.bodyType, request.formData)
      : request.data;
  }

  return { method, url, headers, body };
}

export function* copyCurl() {
  const request = yield select(getRequest);

  const fetchInput = {
    redirect: 'follow',
    ...yield call(normalize, request),
  };

  yield call(addAuth, fetchInput, request);

  return clipboard.writeText(fetchToCurl(fetchInput));
}

export function* fetchData({ request }) {
  try {
    yield put(executeRequest());

    const normalized = yield call(normalize, request);
    const ignoreCache = yield select(getIgnoreCache);

    const fetchInput = {
      ...normalized,
      redirect: 'follow',
      credentials: 'include', // Include cookies
      cache: ignoreCache ? 'no-store' : 'default',
    };

    yield call(addAuth, fetchInput, request);

    const historyEntry = Immutable.fromJS(request)
      .set('method', normalized.method)
      .set('url', normalized.url)
      .set('id', requestID());

    yield put(pushHistory(historyEntry));

    const beforeTime = yield call(getBeforeTime);
    const response = yield call(fetch, fetchInput.url, fetchInput);
    const millisPassed = yield call(getMillisPassed, beforeTime);

    const responseHeaders = buildResponseHeaders(response);
    const responseBody = yield apply(response, response.text);

    yield put(receiveResponse({
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: responseHeaders,
      method: normalized.method,
      totalTime: millisPassed,
    }));
  } catch (error) {
    yield put({ type: REQUEST_FAILED, error });
  }
}

function setContentType(array, value) {
  const index = array.findIndex(item => item.name === 'Content-Type');

  // Replace any existing Content-Type headers
  if (index > -1) {
    return [
      ...array.slice(0, index),
      { name: 'Content-Type', value },
      ...array.slice(index + 1),
    ];
  }

  // When the last row is empty, overwrite it instead of pushing
  const lastItem = array.length >= 1
    ? array[array.length - 1]
    : null;
  if (lastItem && !lastItem.name) {
    return [
      ...array.slice(0, array.length - 1),
      { name: 'Content-Type', value },
    ];
  }

  return [
    ...array,
    { name: 'Content-Type', value },
  ];
}

export function* changeBodyTypeSaga({ bodyType }) {
  let headers = yield select(getHeaders);
  switch (bodyType) {
    case 'multipart':
      headers = setContentType(headers, 'multipart/form-data');
      break;
    case 'urlencoded':
      headers = setContentType(headers, 'application/x-www-form-urlencoded');
      break;
    case 'json':
      headers = setContentType(headers, 'application/json');
      break;
    case 'custom':
      break;
    default:
      throw new Error(`Body type ${bodyType} is not supported`);
  }
  yield put(change(requestForm, 'headers', headers));
  // For persistence on load
  yield put(updateOption('bodyType', bodyType));
}

window.document.title = PAGE_TITLE;

function* findSelectRequest({ id, noFormInit }) {
  let foundID = null;

  if (id) {
    const history = (yield select(getHistory)).toJS();
    const collections = (yield select(getCollections)).toJS();

    const found = history.find(request => request.id === id)
      || collections.reduce((acc, collection) => (
        acc || collection.requests.find(request => request.id === id)
      ), null);

    if (found) {
      foundID = found.id;
      delete found.id;

      if (!noFormInit) {
        yield put(initialize(requestForm, found));
        yield call(focusUrlField);

        const { method, headers, auth, formData, data } = found;

        if (headers.find(header => (header.name || header.value))) {
          yield put(expand(headersCollapsibleID));
        }

        if (auth.type !== 'disabled') {
          yield put(expand(authCollapsibleID));
        }

        if (!['GET', 'HEAD'].includes(method) && ((formData.length) > 0 || data)) {
          yield put(expand(bodyCollapsibleID));
        }
      }
    }
  }

  yield put({ type: SELECT_REQUEST, id: foundID });

  setLocationHash(foundID, !foundID);
  window.document.title = `${PAGE_TITLE}${foundID ? `: #${foundID}` : ''}`;
}

export default function* rootSaga() {
  yield takeLatest(SEND_REQUEST, fetchData);
  yield takeEvery(COPY_CURL, copyCurl);
  yield takeEvery(CHANGE_BODY_TYPE, changeBodyTypeSaga);
  yield takeEvery(FIND_SELECT_REQUEST, findSelectRequest);
}
