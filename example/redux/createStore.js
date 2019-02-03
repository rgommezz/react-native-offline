import { createStore, combineReducers, applyMiddleware } from 'redux';
import {
  reducer as network,
  createNetworkMiddleware,
} from 'react-native-offline';
import counter from './reducer';

const networkMiddleware = createNetworkMiddleware({
  regexActionType: /^OTHER/,
  actionTypes: ['ADD_ONE', 'SUB_ONE'],
});

const rootReducer = combineReducers({
  counter,
  network,
});

const store = createStore(rootReducer, applyMiddleware(networkMiddleware));
export default () => store;
