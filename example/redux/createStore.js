import { createStore, combineReducers, applyMiddleware } from 'redux';
import {
  reducer as network,
  createNetworkMiddleware,
} from 'react-native-offline';
import counter from './reducer';

const networkMiddleware = createNetworkMiddleware({
  actionTypes: ['ADD_ONE', 'SUB_ONE', 'NO_UI'],
});

const rootReducer = combineReducers({
  counter,
  network,
});

const store = createStore(rootReducer, applyMiddleware(networkMiddleware));
export default () => store;
