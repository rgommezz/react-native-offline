/* @flow */

import { put, select, call, take, cancelled, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { NetInfo } from 'react-native';
import checkInternetAccess from './checkInternetAccess';
import { connectionChange } from './actionCreators';
import type { NetworkState } from './types';

export function* forceTryConnectivitySaga(): Generator<*, *, *> {
  yield call(handleConnectivityChange, true);
}

export function* networkEventsListenerSaga(
  timeout?: number,
  pingServerUrl?: string,
): Generator<*, *, *> {
  const isConnectedChannel = yield call(createNetInfoIsConnectedChannel);
  try {
    while (true) {
      const isConnected = yield take(isConnectedChannel);
      yield fork(handleConnectivityChange, isConnected, timeout, pingServerUrl);
    }
  } finally {
    if (yield cancelled()) {
      isConnectedChannel.close();
    }
  }
}

function* handleConnectivityChange(
  isConnected: boolean,
  timeout?: number,
  pingServerUrl?: string,
) {
  const hasInternetAccess = yield call(
    checkInternetAccess,
    isConnected,
    timeout,
    pingServerUrl,
  );
  yield put(connectionChange(hasInternetAccess));
  const actionQueue = select(
    (state: { network: NetworkState }) => state.network.actionQueue,
  );

  if (hasInternetAccess && actionQueue.length > 0) {
    for (const action of actionQueue) { // eslint-disable-line
      yield put(action);
    }
  }
}

function createNetInfoIsConnectedChannel() {
  return eventChannel((emit: Function) => {
    NetInfo.isConnected.addEventListener('connectionChange', emit);

    return () => {
      NetInfo.isConnected.removeEventListener('connectionChange', emit);
    };
  });
}
