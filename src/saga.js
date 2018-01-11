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

export default function* networkEventsListenerSaga(
  {
    timeout = 3000,
    pingServerUrl = 'https://google.com',
    withExtraHeadRequest = true,
    checkConnectionInterval = 0,
  }: Arguments = {},
): Generator<*, *, *> {
  yield fork(
    handleNetInfoChangeChannel,
    timeout,
    pingServerUrl,
    withExtraHeadRequest,
  );
  if (checkConnectionInterval) {
    yield fork(
      handleCheckConnectionIntervalChannel,
      timeout,
      pingServerUrl,
      checkConnectionInterval,
    );
  }
}

function* handleNetInfoChangeChannel(
  timeout: number,
  pingServerUrl: string,
  withExtraHeadRequest: boolean,
): Generator<*, *, *> {
  const netInfoChangeChannel = yield call(createNetInfoConnectionChangeChannel);

  function* handleNetInfoChange(isConnected: boolean) {
    if (!isConnected) {
      yield call(handleConnectivityChange, isConnected);
    } else {
      yield call(checkInternet, timeout, pingServerUrl);
    }
  }

  try {
    while (true) {
      const isConnected = yield take(netInfoChangeChannel);
      yield fork(
        withExtraHeadRequest ? handleNetInfoChange : handleConnectivityChange,
        isConnected,
      );
    }
  } finally {
    if (yield cancelled()) {
      netInfoChangeChannel.close();
    }
  }
}

function* handleCheckConnectionIntervalChannel(
  timeout?: number,
  pingServerUrl?: string,
  checkConnectionInterval: number,
): Generator<*, *, *> {
  const checkConnectionIntervalChannel = yield call(
    createCheckConnectionIntervalChannel,
    checkConnectionInterval,
  );
  try {
    while (true) {
      yield take(checkConnectionIntervalChannel);
      yield fork(checkInternet, timeout, pingServerUrl);
    }
  } finally {
    if (yield cancelled()) {
      checkConnectionIntervalChannel.close();
    }
  }
}

function* checkInternet(
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

function* handleConnectivityChange(
  hasInternetAccess: boolean,
): Generator<*, *, *> {
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

function createNetInfoConnectionChangeChannel() {
  return eventChannel((emit: Function) => {
    NetInfo.isConnected.addEventListener('connectionChange', emit);
    return () => {
      NetInfo.isConnected.removeEventListener('connectionChange', emit);
    };
  });
}

function createCheckConnectionIntervalChannel(checkConnectionInterval: number) {
  return eventChannel((emit: Function) => {
    const interval = setInterval(() => emit(true), checkConnectionInterval);
    return () => {
      clearInterval(interval);
    };
  });
}
