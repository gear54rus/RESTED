import { call, apply, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { change } from 'redux-form';

import { apsTokenTypes } from 'utils/aps';
import { basicAuthHeader } from 'utils/request';
import { requestForm } from 'components/Request';

import { SEND_REQUEST, EXECUTE_REQUEST, TOKEN_FETCHED, FETCH_ERROR } from './types';

function createResource({ url }) {
  return url;
}

function buildHeaders({ username, password }) {
  const headers = new Headers();

  if (username) {
    headers.append(...basicAuthHeader(username, password));
  }

  return headers;
}

function generateBody({ type, params }) {
  return apsTokenTypes[type].payload.generator(...params);
}

function getTokenDescription(type, params) {
  const typeInfo = apsTokenTypes[type];

  const typeCaption = typeInfo.caption;
  const paramCaptions = typeInfo.payload.placeholders
    .map((placeholder, index) => (params[index] ? `${placeholder}: ${params[index]}` : null))
    .filter(caption => caption)
    .join(', ');

  return `${typeCaption} token (${paramCaptions})`;
}

function getTokenFromResponseBody(body) {
  const regex = {
    status: /<member><name>status<\/name><value><i4>([^<]+)<\/i4><\/value><\/member>/,
    token: /<member><name>aps_token<\/name><value><string>([^<]+)<\/string><\/value><\/member>/,
    error: /<member><name>error_message<\/name><value><string>([^<]+)<\/string><\/value><\/member>/,
  };

  let match = regex.status.exec(body);

  if (!match) {
    return null;
  }

  const status = match[1];

  if (status !== '0') {
    match = regex.error.exec(body);

    return match ? { error: match[1] } : null;
  }

  match = regex.token.exec(body);

  if (!match) {
    return null;
  }

  return { token: match[1] };
}


function* fetchToken({ request }) {
  try {
    yield put({ type: EXECUTE_REQUEST });

    const resource = yield call(createResource, request);
    const headers = yield call(buildHeaders, request);
    const body = yield call(generateBody, request);

    const response = yield call(fetch, resource, {
      method: 'POST',
      credentials: 'omit',
      redirect: 'error',
      body,
      headers,
    });

    if (response.status !== 200) throw new Error(`Server responded with HTTP ${response.status}`);

    const responseBody = yield apply(response, response.text);
    const result = getTokenFromResponseBody(responseBody);

    if (!result) throw new Error('Unable to parse OA API response');
    if (result.error) throw new Error(`OA API responded: ${result.error}`);

    const description = getTokenDescription(request.type, request.params);

    yield put({
      type: TOKEN_FETCHED,
      token: result.token,
      description,
      fetchTime: new Date(),
    });
  } catch (error) {
    yield put({ type: FETCH_ERROR, error });
  }
}

function* tokenFetched({ token }) {
  yield put(change(requestForm, 'apsToken.value', token));
}

export default function* rootSaga() {
  yield takeLatest(SEND_REQUEST, fetchToken);
  yield takeEvery(TOKEN_FETCHED, tokenFetched);
}
