import Immutable from 'immutable';
import localforage from 'localforage';
import { select, put, call, takeEvery } from 'redux-saga/effects';

import { selectRequest } from 'store/request/actions';
import { getSelected } from 'store/request/selectors';
import { getHistorySize } from 'store/options/selectors';
import { isRequestID, requestID } from 'utils/request';

import {
  FETCH_REQUESTED,
  PUSH_REQUESTED,
  CLEAR_REQUESTED,
  DELETE_REQUESTED,
  FETCH_HISTORY,
  RECEIVE_HISTORY,
  PUSH_HISTORY,
  PRUNE_HISTORY,
  CLEAR_HISTORY,
  DELETE_ITEM,
} from './types';
import { getHistory } from './selectors';

function* updateLocalStorage() {
  const history = (yield select(getHistory)).toJS();
  yield call(localforage.setItem, 'history', history);
}

export function* fetchHistorySaga() {
  yield put({ type: FETCH_HISTORY });
  let history = (yield call(localforage.getItem, 'history')) || [];

  const update = history.some(request => {
    // Migrate to short IDs
    if (!isRequestID(request.id)) {
      request.id = requestID();

      return true;
    }

    return false;
  });

  history = Immutable.fromJS(history);
  yield put({ type: RECEIVE_HISTORY, history });

  if (update) {
    yield call(updateLocalStorage);
  }
}

function* pushHistorySaga({ request }) {
  // Ensure history is loaded before fetching
  yield call(fetchHistorySaga);

  // Request was not edited, so it already is stored somewhere
  if (yield select(getSelected)) {
    return;
  }

  yield put({ type: PUSH_HISTORY, request });
  yield put(selectRequest(request.get('id'), true));
  const historySize = yield select(getHistorySize);
  yield put({ type: PRUNE_HISTORY, historySize });
  yield call(updateLocalStorage);
}

function* clearHistorySaga() {
  yield put({ type: CLEAR_HISTORY });
  yield call(updateLocalStorage);
}

function* removeFromHistorySaga({ index }) {
  yield put({ type: DELETE_ITEM, index });
  yield call(updateLocalStorage);
}

export default function* rootSaga() {
  yield takeEvery(FETCH_REQUESTED, fetchHistorySaga);
  yield takeEvery(PUSH_REQUESTED, pushHistorySaga);
  yield takeEvery(CLEAR_REQUESTED, clearHistorySaga);
  yield takeEvery(DELETE_REQUESTED, removeFromHistorySaga);
}

