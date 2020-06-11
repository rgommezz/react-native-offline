import { put, select, call, take, cancelled, fork } from 'redux-saga/effects';
import { eventChannel, Subscribe } from 'redux-saga';
import { AppState, Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { networkSelector } from './createReducer';
import checkInternetAccess from '../utils/checkInternetAccess';
import { connectionChange } from './actionCreators';
import { ConnectivityArgs, NetworkState } from '../types';
import {
  DEFAULT_TIMEOUT,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_HTTP_METHOD,
  DEFAULT_ARGS,
} from '../utils/constants';

type NetInfoChangeArgs = Omit<
  ConnectivityArgs,
  'pingInterval' | 'pingOnlyIfOffline' | 'pingInBackground'
>;
type CheckInternetArgs = Omit<NetInfoChangeArgs, 'shouldPing'> & {
  pingInBackground: boolean;
};

export function netInfoEventChannelFn(emit: (param: NetInfoState) => unknown) {
  return NetInfo.addEventListener(emit);
}

export function intervalChannelFn(interval: number) {
  return (emit: (param: boolean) => unknown) => {
    const iv = setInterval(() => emit(true), interval);
    return () => {
      clearInterval(iv);
    };
  };
}

/**
 * Returns a factory function that creates a channel from network connection change events
 * @returns {Channel<T>}
 */
export function createNetInfoConnectionChangeChannel<T = any>(
  channelFn: Subscribe<T>,
) {
  return eventChannel(channelFn);
}

/**
 * Returns a factory function that creates a channel from an interval
 * @param interval
 * @returns {Channel<T>}
 */
export function createIntervalChannel(interval: number, channelFn: Function) {
  const handler = channelFn(interval);
  return eventChannel(handler);
}

/**
 * Creates a NetInfo change event channel that:
 * - Listens to NetInfo connection change events
 * - If shouldPing === true, it first verifies we have internet access
 * - Otherwise it calls handleConnectivityChange immediately to process the new information into the redux store
 * @param pingTimeout
 * @param pingServerUrl
 * @param shouldPing
 * @param httpMethod
 * @param customHeaders
 */

export function* netInfoChangeSaga({
  pingTimeout,
  pingServerUrl,
  shouldPing,
  httpMethod,
  customHeaders,
}: NetInfoChangeArgs) {
  if (Platform.OS === 'android') {
    const networkState: NetInfoState = yield call([NetInfo, NetInfo.fetch]);
    yield fork(connectionHandler, {
      shouldPing,
      isConnected: networkState.isConnected,
      pingTimeout,
      pingServerUrl,
      httpMethod,
      customHeaders,
    });
  }
  const chan = yield call(
    createNetInfoConnectionChangeChannel,
    netInfoEventChannelFn,
  );
  try {
    while (true) {
      const isConnected = yield take(chan);
      yield fork(connectionHandler, {
        shouldPing,
        isConnected,
        pingTimeout,
        pingServerUrl,
        httpMethod,
        customHeaders,
      });
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

/**
 * Either checks internet by pinging a server or calls the store handler function
 * @param shouldPing
 * @param isConnected
 * @param pingTimeout
 * @param pingServerUrl
 * @param httpMethod
 * @param customHeaders
 * @returns {IterableIterator<ForkEffect | *>}
 */

export function* connectionHandler({
  shouldPing,
  isConnected,
  pingTimeout,
  pingServerUrl,
  httpMethod,
  customHeaders,
}: NetInfoChangeArgs & { isConnected: boolean }) {
  if (shouldPing && isConnected) {
    yield fork(checkInternetAccessSaga, {
      pingTimeout,
      pingServerUrl,
      httpMethod,
      pingInBackground: false,
      customHeaders,
    });
  } else {
    yield fork(handleConnectivityChange, isConnected);
  }
}

/**
 * Creates an interval channel that periodically verifies internet access
 * @param pingTimeout
 * @param pingServerUrl
 * @param interval
 * @param pingOnlyIfOffline
 * @param pingInBackground
 * @param httpMethod
 * @param customHeaders
 * @returns {IterableIterator<*>}
 */
export function* connectionIntervalSaga({
  pingTimeout,
  pingServerUrl,
  pingInterval,
  pingOnlyIfOffline,
  pingInBackground,
  httpMethod,
  customHeaders,
}: Omit<ConnectivityArgs, 'shouldPing'>) {
  const chan = yield call(
    createIntervalChannel,
    pingInterval,
    intervalChannelFn,
  );
  try {
    while (true) {
      yield take(chan);
      const state: NetworkState = yield select(networkSelector);
      if (!(state.isConnected && pingOnlyIfOffline === true)) {
        yield fork(checkInternetAccessSaga, {
          pingTimeout,
          pingServerUrl,
          httpMethod,
          pingInBackground,
          customHeaders,
        });
      }
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

/**
 * Saga that verifies internet connection, besides connectivity, by pinging a server of your choice
 * @param pingServerUrl
 * @param pingTimeout
 * @param httpMethod
 * @param pingInBackground
 * @param customHeaders
 */

export function* checkInternetAccessSaga({
  pingServerUrl,
  pingTimeout,
  httpMethod,
  pingInBackground,
  customHeaders,
}: CheckInternetArgs) {
  if (pingInBackground === false && AppState.currentState !== 'active') {
    return; // <-- Return early as we don't care about connectivity if app is not in foreground.
  }
  const hasInternetAccess = yield call(checkInternetAccess, {
    url: pingServerUrl,
    timeout: pingTimeout,
    method: httpMethod,
    customHeaders,
  });
  yield call(handleConnectivityChange, hasInternetAccess);
}

/**
 * Takes action under the new network connection value:
 * - Dispatches a '@@network-connectivity/CONNECTION_CHANGE' action type
 * - Flushes the queue of pending actions if we are connected back to the internet
 * @param hasInternetAccess
 */
export function* handleConnectivityChange(hasInternetAccess: boolean) {
  const state: NetworkState = yield select(networkSelector);
  if (state.isConnected !== hasInternetAccess) {
    yield put(connectionChange(hasInternetAccess));
  }
}

/**
 * Saga that controls internet connectivity in your whole application.
 * You just need to fork it from your root saga.
 * It receives the same parameters as withNetworkConnectivity HOC
 * @param pingTimeout
 * @param pingServerUrl
 * @param shouldPing
 * @param pingInterval
 * @param pingOnlyIfOffline
 * @param pingInBackground
 * @param httpMethod
 * @param customHeaders
 */
export default function* networkSaga(args?: ConnectivityArgs) {
  const {
    pingTimeout = DEFAULT_TIMEOUT,
    pingServerUrl = DEFAULT_PING_SERVER_URL,
    pingInterval = 0,
    shouldPing = true,
    pingOnlyIfOffline = false,
    pingInBackground = false,
    httpMethod = DEFAULT_HTTP_METHOD,
    customHeaders,
  } = args || DEFAULT_ARGS;

  yield fork(netInfoChangeSaga, {
    pingTimeout,
    pingServerUrl,
    shouldPing,
    httpMethod,
    customHeaders,
  });
  if (pingInterval > 0) {
    yield fork(connectionIntervalSaga, {
      pingTimeout,
      pingServerUrl,
      pingInterval,
      pingOnlyIfOffline,
      pingInBackground,
      httpMethod,
      customHeaders,
    });
  }
}
