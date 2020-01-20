import { createStore, combineReducers, applyMiddleware } from 'redux';

// TODO: removed require and imported it from file system,
// I hope this is okay
import createSagaMiddleware from 'redux-saga';
import {
  reducer as network,
  createNetworkMiddleware,
} from 'react-native-offline';

import counter from './reducer';
import rootSaga from './sagas';

type GetReducerState<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => infer Q ? Q : never
};

const reducers = {
  counter,
  network,
};

export type AppState = GetReducerState<typeof reducers>;
export default function createReduxStore({
  withSaga = false,
  queueReleaseThrottle = 1000,
} = {}) {
  const networkMiddleware = createNetworkMiddleware({
    regexActionType: /^OTHER/,
    actionTypes: ['ADD_ONE', 'SUB_ONE'],
    queueReleaseThrottle,
  });

  const sagaMiddleware = createSagaMiddleware();

  const rootReducer = combineReducers(reducers);

  const middlewares = [networkMiddleware];
  if (withSaga === true) {
    middlewares.push(sagaMiddleware);
  }

  const store = createStore(rootReducer, applyMiddleware(...middlewares));

  if (withSaga === true) {
    sagaMiddleware.run(rootSaga);
  }

  return store;
}
