/* @flow */

import { put, select, call, take, cancelled, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { NetInfo } from 'react-native';
import checkInternetAccess from './checkInternetAccess';
import { connectionChange } from './actionCreators';
import type { NetworkState } from './types';

type Arguments = {
  timeout?: number,
  pingServerUrl?: string,
  withExtraHeadRequest?: boolean,
  checkConnectionInterval?: number,
};

/**
 * Returns a factory function that creates a channel from network connection change events
 * @returns {Channel<T>}
 */
function createNetInfoConnectionChangeChannel() {
  return eventChannel((emit: (param: boolean) => mixed) => {
    NetInfo.isConnected.addEventListener('connectionChange', emit);
    return () => {
      NetInfo.isConnected.removeEventListener('connectionChange', emit);
    };
  });
}

/**
 * Returns a factory function that creates a channel from an interval
 * @param interval
 * @returns {Channel<T>}
 */
function createIntervalChannel(interval: number) {
  return eventChannel((emit: (param: boolean) => mixed) => {
    const iv = setInterval(() => emit(true), interval);
    return () => {
      clearInterval(iv);
    };
  });
}

/**
 * Creates a NetInfo change event channel that:
 * - Listens to NetInfo connection change events
 * - If withExtraHeadRequest === true, it first verifies we have internet access
 * - Otherwise it calls handleConnectivityChange immediately to process the new information into the redux store
 * @param timeout
 * @param pingServerUrl
 * @param withExtraHeadRequest
 */
function* netInfoChangeSaga(
  timeout: number,
  pingServerUrl: string,
  withExtraHeadRequest: boolean,
): Generator<*, *, *> {
  const chan = yield call(createNetInfoConnectionChangeChannel);
  try {
    while (true) {
      const isConnected = yield take(chan);
      if (withExtraHeadRequest && isConnected) {
        yield fork(checkInternetAccessSaga, timeout, pingServerUrl);
      } else {
        yield fork(handleConnectivityChange, isConnected);
      }
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

/**
 * Creates an interval channel that periodically verifies internet access
 * @param timeout
 * @param pingServerUrl
 * @param interval
 */
function* connectionIntervalSaga(
  timeout?: number,
  pingServerUrl?: string,
  interval: number,
): Generator<*, *, *> {
  const chan = yield call(createIntervalChannel, interval);
  try {
    while (true) {
      yield take(chan);
      yield fork(checkInternetAccessSaga, timeout, pingServerUrl);
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}

/**
 * Saga that verifies internet connection, besides connectivity, by pinging a server of your choice
 * @param timeout
 * @param pingServerUrl
 */
function* checkInternetAccessSaga(
  timeout?: number,
  pingServerUrl?: string,
): Generator<*, *, *> {
  const hasInternetAccess = yield call(
    checkInternetAccess,
    timeout,
    pingServerUrl,
  );
  yield call(handleConnectivityChange, hasInternetAccess);
}

/**
 * Takes action under the new network connection value:
 * - Dispatches a '@@network-connectivity/CONNECTION_CHANGE' action type
 * - Flushes the queue of pending actions if we are connected back to the internet
 * @param hasInternetAccess
 */
function* handleConnectivityChange(
  hasInternetAccess: boolean,
): Generator<*, *, *> {
  yield put(connectionChange(hasInternetAccess));
  const actionQueue = yield select(
    (state: { network: NetworkState }) => state.network.actionQueue,
  );

  if (hasInternetAccess && actionQueue.length > 0) {
    // eslint-disable-next-line
    for (const action of actionQueue) {
      yield put(action);
    }
  }
}

/**
 * Saga that controls internet connectivity in your whole application.
 * You just need to fork it from your root saga.
 * It receives the same parameters as withNetworkConnectivity HOC
 * @param timeout
 * @param pingServerUrl
 * @param withExtraHeadRequest
 * @param checkConnectionInterval
 */
export default function* networkEventsListenerSaga({
  timeout = 3000,
  pingServerUrl = 'https://www.google.com/',
  withExtraHeadRequest = true,
  checkConnectionInterval = 0,
}: Arguments = {}): Generator<*, *, *> {
  yield fork(netInfoChangeSaga, timeout, pingServerUrl, withExtraHeadRequest);
  if (checkConnectionInterval) {
    yield fork(
      connectionIntervalSaga,
      timeout,
      pingServerUrl,
      checkConnectionInterval,
    );
  }
}
