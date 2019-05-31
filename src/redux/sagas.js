/* @flow */
/* eslint flowtype/require-parameter-type: 0 */
import { put, select, call, take, cancelled, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { AppState, Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { networkSelector } from './reducer';
import checkInternetAccess from '../utils/checkInternetAccess';
import { connectionChange } from './actionCreators';
import type { HTTPMethod } from '../types';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../utils/constants';

type Arguments = {
  pingTimeout: number,
  pingServerUrl: string,
  shouldPing: boolean,
  pingInterval: number,
  pingOnlyIfOffline: boolean,
  pingInBackground: boolean,
  httpMethod: HTTPMethod,
};

export function netInfoEventChannelFn(emit: (param: boolean) => mixed) {
  NetInfo.isConnected.addEventListener('connectionChange', emit);
  return () => {
    NetInfo.isConnected.removeEventListener('connectionChange', emit);
  };
}

export function intervalChannelFn(interval: number) {
  return (emit: (param: boolean) => mixed) => {
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
export function createNetInfoConnectionChangeChannel(channelFn) {
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
 */
export function* netInfoChangeSaga({
  pingTimeout,
  pingServerUrl,
  shouldPing,
  httpMethod,
}): Generator<*, *, *> {
  if (Platform.OS === 'android') {
    const initialConnection = yield call([NetInfo, NetInfo.isConnected.fetch]);
    yield fork(connectionHandler, {
      shouldPing,
      isConnected: initialConnection,
      pingTimeout,
      pingServerUrl,
      httpMethod,
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
 * @returns {IterableIterator<ForkEffect | *>}
 */
export function* connectionHandler({
  shouldPing,
  isConnected,
  pingTimeout,
  pingServerUrl,
  httpMethod,
}) {
  if (shouldPing && isConnected) {
    yield fork(checkInternetAccessSaga, {
      pingTimeout,
      pingServerUrl,
      httpMethod,
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
 * @returns {IterableIterator<*>}
 */
export function* connectionIntervalSaga({
  pingTimeout,
  pingServerUrl,
  pingInterval,
  pingOnlyIfOffline,
  pingInBackground,
  httpMethod,
}): Generator<*, *, *> {
  const chan = yield call(
    createIntervalChannel,
    pingInterval,
    intervalChannelFn,
  );
  try {
    while (true) {
      yield take(chan);
      const { isConnected } = yield select(networkSelector);
      if (!(isConnected && pingOnlyIfOffline === true)) {
        yield fork(checkInternetAccessSaga, {
          pingTimeout,
          pingServerUrl,
          httpMethod,
          pingInBackground,
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
 */
export function* checkInternetAccessSaga({
  pingServerUrl,
  pingTimeout,
  httpMethod,
  pingInBackground,
}): Generator<*, *, *> {
  if (pingInBackground === false && AppState.currentState !== 'active') {
    return; // <-- Return early as we don't care about connectivity if app is not in foreground.
  }
  const hasInternetAccess = yield call(checkInternetAccess, {
    url: pingServerUrl,
    timeout: pingTimeout,
    method: httpMethod,
  });
  yield call(handleConnectivityChange, hasInternetAccess);
}

/**
 * Takes action under the new network connection value:
 * - Dispatches a '@@network-connectivity/CONNECTION_CHANGE' action type
 * - Flushes the queue of pending actions if we are connected back to the internet
 * @param hasInternetAccess
 */
export function* handleConnectivityChange(
  hasInternetAccess: boolean,
): Generator<*, *, *> {
  const { isConnected } = yield select(networkSelector);
  if (isConnected !== hasInternetAccess) {
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
 */
export default function* networkSaga({
  pingTimeout = DEFAULT_TIMEOUT,
  pingServerUrl = DEFAULT_PING_SERVER_URL,
  shouldPing = true,
  pingInterval = 0,
  pingOnlyIfOffline = false,
  pingInBackground = false,
  httpMethod = DEFAULT_HTTP_METHOD,
}: Arguments = {}): Generator<*, *, *> {
  yield fork(netInfoChangeSaga, {
    pingTimeout,
    pingServerUrl,
    shouldPing,
    pingOnlyIfOffline,
    pingInBackground,
    httpMethod,
  });
  if (pingInterval > 0) {
    yield fork(connectionIntervalSaga, {
      pingTimeout,
      pingServerUrl,
      pingInterval,
      pingOnlyIfOffline,
      pingInBackground,
      httpMethod,
    });
  }
}
