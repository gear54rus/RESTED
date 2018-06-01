import Immutable from 'immutable';
import localforage from 'localforage';
import { select, put, call, takeEvery } from 'redux-saga/effects';
import { change } from 'redux-form';

import { requestForm } from 'components/Request';
import { selectRequest } from 'store/request/actions';
import { fetchHistorySaga } from 'store/history/sagas';
import { fetchCollectionsSaga } from 'store/collections/sagas';
import { initFromURLHash } from 'store/auth/apsToken/actions';
import { isRequestID } from 'utils/request';

import { FETCH_REQUESTED, UPDATE_REQUESTED, UPDATE_OPTION } from './types';
import { startFetch, receiveOptions } from './actions';
import { getOptions, getBodyType } from './selectors';

function* updateLocalStorage() {
  const options = (yield select(getOptions)).toJS();
  yield call(localforage.setItem, 'options', options.options);
}

export function initializeHashChangeListener(store) {
  window.addEventListener('hashchange', ({ newURL }) => {
    const url = new window.URL(newURL);

    store.dispatch(
      selectRequest(
        decodeURIComponent(url.hash.slice(1)),
      ),
    );
  });
}

function* fetchOptionsSaga() {
  yield put(startFetch());
  let options = yield call(localforage.getItem, 'options');

  options = Immutable.fromJS(options) || Immutable.Map();
  yield put(receiveOptions(options));

  // The selected bodyType is persisted across reloads and is put into the form
  // when we are done loading the initial options
  const bodyType = yield select(getBodyType);

  yield put(change(requestForm, 'bodyType', bodyType));

  const hash = decodeURIComponent(window.location.hash.slice(1));

  if (!hash) return;

  if (isRequestID(hash)) {
    yield call(fetchCollectionsSaga);
    yield call(fetchHistorySaga);
    yield put(selectRequest(hash));

    return;
  }

  try {
    yield put(initFromURLHash(JSON.parse(hash)));
  } catch (_) {
    //
  }
}

function* updateOptionSaga({ option, value }) {
  yield put({ type: UPDATE_OPTION, option, value });
  yield call(updateLocalStorage);
}

export default function* rootSaga() {
  yield takeEvery(FETCH_REQUESTED, fetchOptionsSaga);
  yield takeEvery(UPDATE_REQUESTED, updateOptionSaga);
}

