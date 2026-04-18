import * as offlineActionCreators from './redux/actionCreators';
import * as offlineActionTypes from './redux/actionTypes';
import createReducer from './redux/createReducer';

export { default as NetworkProvider } from './components/NetworkProvider';
export { default as ReduxNetworkProvider } from './components/ReduxNetworkProvider';
export { default as NetworkConsumer } from './components/NetworkConsumer';
export { default as useIsConnected } from './hooks/useIsConnected';
export { default as createNetworkMiddleware } from './redux/createNetworkMiddleware';
export { default as networkSaga } from './redux/sagas';
export { default as checkInternetConnection } from './utils/checkInternetConnection';

export { offlineActionCreators, offlineActionTypes };
export { default as createReducer } from './redux/createReducer';
export declare const reducer: ReturnType<typeof createReducer>;

export { connectionChange, fetchOfflineMode, removeActionFromQueue, dismissActionsFromQueue, changeQueueSemaphore } from './redux/actionCreators';
export { CONNECTION_CHANGE, FETCH_OFFLINE_MODE, REMOVE_FROM_ACTION_QUEUE, DISMISS_ACTIONS_FROM_QUEUE, CHANGE_QUEUE_SEMAPHORE } from './redux/actionTypes';

export {
  Thunk,
  EnqueuedAction,
  MetaProps,
  FluxAction,
  NetworkState,
  ConnectivityState,
  HTTPMethod,
  AddUndefined,
  ConnectivityArgs,
  SemaphoreColor,
  HTTPHeaders,
} from './types';
