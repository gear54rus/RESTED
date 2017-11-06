import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
// eslint-disable-next-line import/no-extraneous-dependencies
import { composeWithDevTools } from 'remote-redux-devtools';
// Redux devtools. Is not a part of the prod bundle

import rootReducer from './';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();

const enhancer = composeWithDevTools(
  // Middleware
  applyMiddleware(sagaMiddleware),
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  // Hot reload reducers
  if (module.hot) {
    module.hot.accept('./', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('./').default),
    );
  }

  sagaMiddleware.run(sagas);

  return store;
}

