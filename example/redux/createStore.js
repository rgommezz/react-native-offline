import { createStore, combineReducers, applyMiddleware } from 'redux';
import {
  reducer as network,
  createNetworkMiddleware,
} from 'react-native-offline';
import createSagaMiddleware from 'redux-saga';
import counter from './reducer';
import rootSaga from './sagas';

export default function createReduxStore({ withSaga = false } = {}) {
  const networkMiddleware = createNetworkMiddleware({
    regexActionType: /^OTHER/,
    actionTypes: ['ADD_ONE', 'SUB_ONE'],
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

  const store = createStore(rootReducer, applyMiddleware(...middlewares));

  if (withSaga === true) {
    sagaMiddleware.run(rootSaga);
  }

  return store;
}
