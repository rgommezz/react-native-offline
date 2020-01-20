import _reducer from './redux/createReducer';
export { default as NetworkProvider } from './components/NetworkProvider';
export {
  default as ReduxNetworkProvider,
} from './components/ReduxNetworkProvider';
export { default as NetworkConsumer } from './components/NetworkConsumer';

export {
  default as createNetworkMiddleware,
} from './redux/createNetworkMiddleware';
export * as offlineActionTypes  from './redux/actionTypes';
export { default as networkSaga } from './redux/sagas';
export {
  default as checkInternetConnection,
} from './utils/checkInternetConnection';
export * as offlineActionCreators  from './redux/actionCreators';

export const createReducer = _reducer;
export const reducer = _reducer();

