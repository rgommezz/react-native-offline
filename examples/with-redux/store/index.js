import { createStore, combineReducers, applyMiddleware } from "redux";
import {
  reducer as network,
  createNetworkMiddleware
} from "react-native-offline";
import { composeWithDevTools } from "redux-devtools-extension"; //for debugging
import RootSaga from "../sagas";
import createSagaMiddleware from "redux-saga";
import reducers from "../reducers";
import { ADD_ONE_TO_COUNT } from "../constants/redux";
import { SAGA_ADD_ONE_TO_COUNT } from "../constants/saga";

const rootReducer = combineReducers({
  network,
  reducers
});

const sagaMiddleware = createSagaMiddleware();

//pass all actions through this middleware to help us detect actions to be queued
const networkMiddleware = createNetworkMiddleware({
  actionTypes: [ADD_ONE_TO_COUNT, SAGA_ADD_ONE_TO_COUNT], //pass the actions you want to queue if offline. Alternatively you can pass the actionRegex prop to match a pattern of actions you want to queue
});

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware, networkMiddleware))
); //composeWithDevTools helps us debug our store with a debugger

sagaMiddleware.run(RootSaga);
