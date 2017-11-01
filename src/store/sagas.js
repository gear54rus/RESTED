import { fork } from 'redux-saga/effects';
import requestSagas from './request/sagas';
import historySagas from './history/sagas';
import optionsSagas from './options/sagas';
import collectionsSagas from './collections/sagas';
import urlVariablesSagas from './urlVariables/sagas';
import configSagas from './config/sagas';
import apsSagas from './aps/sagas';

export default function* rootSaga() {
  yield fork(requestSagas);
  yield fork(historySagas);
  yield fork(optionsSagas);
  yield fork(collectionsSagas);
  yield fork(urlVariablesSagas);
  yield fork(configSagas);
  yield fork(apsSagas);
}
