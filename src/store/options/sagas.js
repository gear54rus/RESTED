import Immutable from 'immutable';
import localforage from 'localforage';
import { select, put, call, takeEvery } from 'redux-saga/effects';
import { change } from 'redux-form';

import { OA_CP_TYPES } from 'constants/constants';
import { requestForm } from 'components/Request';
import { apsTokenCollapsibleID } from 'components/Request/APSTokenField';
import { apsRequestForm } from 'components/APSRequest';
import { expand } from 'store/config/actions';

import { FETCH_REQUESTED, UPDATE_REQUESTED, UPDATE_OPTION } from './types';
import { startFetch, receiveOptions } from './actions';
import { getOptions, getBodyType, getURLHash } from './selectors';

function* updateLocalStorage() {
  const options = (yield select(getOptions)).toJS();
  yield call(localforage.setItem, 'options', options.options);
}

function* initFromObject(hashObject) {
  const {
    page,
    url,
    data,
  } = hashObject;

  const urlObject = new URL(url);
  const apsBusURL = new URL(urlObject.origin);
  const oaAPIURL = new URL(`http://${urlObject.hostname}`);

  apsBusURL.pathname = '/aps/2/resources/';
  yield put(change(requestForm, 'url', apsBusURL.href));

  oaAPIURL.port = '8440';
  yield put(change(apsRequestForm, 'url', oaAPIURL.href));

  switch (page) {
    case OA_CP_TYPES.PCP:
    case OA_CP_TYPES.CCP1:
    case OA_CP_TYPES.CCP2:
      yield put(change(apsRequestForm, 'type', 'account'));
      yield put(change(apsRequestForm, 'params[0]', data.accountID));

      if ('subscriptionID' in data) {
        yield put(change(apsRequestForm, 'params[1]', data.subscriptionID));
      }
      break;
    case OA_CP_TYPES.MYCP1:
    case OA_CP_TYPES.MYCP2:
      yield put(change(apsRequestForm, 'type', 'user'));
      yield put(change(apsRequestForm, 'params[0]', data.userID));
      break;
    default:
      break;
  }

  if ('apsToken' in data) {
    yield put(change(requestForm, 'apsToken.value', data.apsToken.value));
    yield put(expand(apsTokenCollapsibleID));
  }
}

// Inspects the URL hash and configures the window
function* initFromURL() {
  const hash = yield select(getURLHash);

  if (!hash) return;

  let init;

  try {
    init = JSON.parse(hash);
  } catch (e) {
    init = hash;
  }

  if (typeof init === 'string') {
    // select request from history
    // yield call(selectRequest, init);
  } else {
    const url = new URL(location);

    url.hash = '';
    history.pushState(null, '', url);

    yield call(initFromObject, init);
  }
}

function* fetchOptionsSaga() {
  yield put(startFetch());
  let options = yield call(localforage.getItem, 'options');

  // v1 -> v2 migration
  if (options && options.length && options[0].options) {
    options = options[0].options;
  }

  options = Immutable.fromJS(options) || Immutable.Map();
  yield put(receiveOptions(options));

  // The selected bodyType is persisted across reloads and is put into the form
  // when we are done loading the initial options
  const bodyType = yield select(getBodyType);
  yield put(change(requestForm, 'bodyType', bodyType));
  yield call(initFromURL);
}

function* updateOptionSaga({ option, value }) {
  yield put({ type: UPDATE_OPTION, option, value });
  yield call(updateLocalStorage);
}

export default function* rootSaga() {
  yield takeEvery(FETCH_REQUESTED, fetchOptionsSaga);
  yield takeEvery(UPDATE_REQUESTED, updateOptionSaga);
}

