import * as offlineActionTypes from './redux/actionTypes';
import * as offlineActionCreators from './redux/actionCreators';
import _reducer from './redux/createReducer';

export { default as NetworkProvider } from './components/NetworkProvider';
export { default as ReduxNetworkProvider } from './components/ReduxNetworkProvider';
export { default as NetworkConsumer } from './components/NetworkConsumer';
export { default as useIsConnected } from './hooks/useIsConnected';

export { default as createNetworkMiddleware } from './redux/createNetworkMiddleware';

export { default as networkSaga } from './redux/sagas';
export { default as checkInternetConnection } from './utils/checkInternetConnection';

export const createReducer = _reducer;
export const reducer = _reducer();

export { offlineActionCreators, offlineActionTypes };
