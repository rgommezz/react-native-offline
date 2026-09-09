import {
  createStore,
  combineReducers,
  applyMiddleware,
  Store,
  AnyAction,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  reducer as network,
  createNetworkMiddleware,
} from 'react-native-offline';

import counter from './reducer';
import rootSaga from './sagas';

// Mirror library NetworkState (not re-exported from package entry)
export type AppState = {
  counter: number;
  network: {
    isConnected: boolean | null;
    isQueuePaused: boolean;
    actionQueue: Array<AnyAction | ((...args: any[]) => any)>;
  };
};

export default function createReduxStore({
  withSaga = false,
  queueReleaseThrottle = 1000,
} = {}): Store<AppState> {
  const networkMiddleware = createNetworkMiddleware({
    regexActionType: /^OTHER/,
    actionTypes: ['ADD_ONE', 'SUB_ONE'],
    queueReleaseThrottle,
  });

  const sagaMiddleware = createSagaMiddleware();

  const rootReducer = combineReducers({
    counter,
    network,
  });

  const middlewares = [networkMiddleware];
  if (withSaga === true) {
    middlewares.push(sagaMiddleware);
  }

  // redux@5 + combineReducers inference is overly strict with these reducers
  const store = (createStore as any)(
    rootReducer,
    applyMiddleware(...middlewares),
  ) as Store<AppState>;

  if (withSaga === true) {
    sagaMiddleware.run(rootSaga);
  }

  return store;
}
