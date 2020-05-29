/* @flow */
import {
  testSaga,
  TestApi,
  TestApiWithEffectsTesters,
} from 'redux-saga-test-plan';
import { Platform, AppState } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import networkSaga, {
  netInfoChangeSaga,
  connectionIntervalSaga,
  createNetInfoConnectionChangeChannel,
  connectionHandler,
  checkInternetAccessSaga,
  handleConnectivityChange,
  createIntervalChannel,
  intervalChannelFn,
  netInfoEventChannelFn,
} from '../src/redux/sagas';
import { connectionChange } from '../src/redux/actionCreators';

import { networkSelector } from '../src/redux/createReducer';

import checkInternetAccess from '../src/utils/checkInternetAccess';
import { DEFAULT_ARGS } from '../src/utils/constants';

const args = DEFAULT_ARGS;

describe('sagas', () => {
  describe('networkSaga', () => {
    it('forks netInfoChangeSaga with the right params', () => {
      const { pingInterval, ...params } = args;
      const { pingInBackground, pingOnlyIfOffline, ...rest } = params;
      testSaga(networkSaga, params)
        .next()
        .fork(netInfoChangeSaga, rest)
        .next()
        .isDone();
    });

    it(`forks netInfoChangeSaga AND sets an interval 
    if pingInterval is higher than 0`, () => {
      const { pingInterval, ...params } = args;
      const {
        pingInBackground,
        pingOnlyIfOffline,
        shouldPing,
        ...rest
      } = params;
      testSaga(networkSaga, { ...args, pingInterval: 3000 })
        .next()
        .fork(netInfoChangeSaga, { ...rest, shouldPing })
        .next()
        .fork(connectionIntervalSaga, {
          ...rest,
          pingInterval: 3000,
          pingOnlyIfOffline,
          pingInBackground,
        })
        .next()
        .isDone();
    });

    it('default parameters', () => {
      const {
        pingOnlyIfOffline,
        pingInterval,
        pingInBackground,
        ...params
      } = args;
      testSaga(networkSaga)
        .next()
        .fork(netInfoChangeSaga, { ...params })
        .next()
        .isDone();
    });
  });

  describe('netInfoChangeSaga', () => {
    const params = {
      pingTimeout: args.pingTimeout,
      pingServerUrl: args.pingServerUrl,
      shouldPing: args.shouldPing,
      httpMethod: args.httpMethod,
      customHeaders: args.customHeaders,
    };
    function channelLoop(saga: TestApi) {
      return saga
        .next()
        .call(createNetInfoConnectionChangeChannel, netInfoEventChannelFn)
        .next('channel')
        .take('channel')
        .next(true)
        .fork(connectionHandler, {
          ...params,
          isConnected: true,
        })
        .next()
        .take('channel');
    }
    it('iOS', () => {
      Platform.OS = 'ios';
      // @ts-ignore
      const saga = testSaga(netInfoChangeSaga, params);
      channelLoop(saga);
    });

    it('Android', () => {
      Platform.OS = 'android';
      // @ts-ignore
      const saga = testSaga(netInfoChangeSaga, params)
        .next()
        .call([NetInfo, NetInfo.fetch])
        .next({ isConnected: false })
        .fork(connectionHandler, {
          ...params,
          isConnected: false,
        });
      channelLoop(saga);
    });

    it('closes the channel when it ends emitting', () => {
      Platform.OS = 'ios';
      const mockCloseFn = jest.fn();
      const mockChannel = {
        close: mockCloseFn,
      };

      const iterator = netInfoChangeSaga(params);
      iterator.next();
      // This will make take(mockChannel) throw an error, since it's not a valid
      // channel or a valid pattern for take() inside the infinite loop,
      // hence executing the finally block.
      iterator.next((mockChannel as unknown) as NetInfoState);
      try {
        iterator.next({ isConnected: true } as NetInfoState);
        expect(mockCloseFn).toHaveBeenCalled();
        // eslint-disable-next-line
      } catch (e) {}
    });

    it('does NOT close the channel if redux-saga does NOT yield a cancelled effect', () => {
      Platform.OS = 'ios';
      const mockCloseFn = jest.fn();
      const mockChannel = {
        close: mockCloseFn,
      };

      const iterator = netInfoChangeSaga(params);
      iterator.next();
      // This will make take(mockChannel) throw an error, since it's not a valid
      // channel or a valid pattern for take() inside the infinite loop,
      // hence executing the finally block.
      iterator.next((mockChannel as unknown) as NetInfoState);
      try {
        iterator.next({ isConnected: false } as NetInfoState);
        expect(mockCloseFn).not.toHaveBeenCalled();
        // eslint-disable-next-line
      } catch (e) {}
    });
  });

  describe('connectionHandler', () => {
    const params = {
      pingTimeout: args.pingTimeout,
      pingServerUrl: args.pingServerUrl,
      shouldPing: true,
      httpMethod: args.httpMethod,
      isConnected: true,
      customHeaders: args.customHeaders,
    };
    it('forks checkInternetAccessSaga if shouldPing AND isConnected are true', () => {
      const saga = testSaga(connectionHandler, params);
      saga
        .next()
        .fork(checkInternetAccessSaga, {
          pingTimeout: args.pingTimeout,
          pingServerUrl: args.pingServerUrl,
          httpMethod: args.httpMethod,
          pingInBackground: args.pingInBackground,
          customHeaders: args.customHeaders,
        })
        .next()
        .isDone();
    });
    it('forks handleConnectivityChange if shouldPing OR isConnected are NOT true', () => {
      params.isConnected = false;
      const saga = testSaga(connectionHandler, params);
      saga
        .next()
        .fork(handleConnectivityChange, false)
        .next()
        .isDone();
    });
  });

  describe('connectionIntervalSaga', () => {
    const { shouldPing, ...params } = args;
    function takeChannelAndGetConnection(saga: TestApi, isConnected: boolean) {
      return saga
        .next()
        .call(createIntervalChannel, 3000, intervalChannelFn)
        .next('channel')
        .take('channel')
        .next()
        .select(networkSelector)
        .next({ isConnected });
    }
    it(`forks checkInternetAccessSaga if it's NOT connected or it is,
     but pingOnlyIfOffline is false`, () => {
      // @ts-ignore
      let saga: TestApiWithEffectsTesters = testSaga(connectionIntervalSaga, {
        ...params,
        pingOnlyIfOffline: false,
        pingInterval: 3000,
      });
      saga = takeChannelAndGetConnection(saga, true);
      saga
        .fork(checkInternetAccessSaga, {
          pingTimeout: params.pingTimeout,
          pingServerUrl: params.pingServerUrl,
          httpMethod: params.httpMethod,
          pingInBackground: params.pingInBackground,
          customHeaders: args.customHeaders,
        })
        .next()
        .take('channel');
    });

    it(`does NOT fork checkInternetAccessSaga if it's connected 
    AND pingOnlyIfOffline is true`, () => {
      // @ts-ignore
      let saga: TestApiWithEffectsTesters = testSaga(connectionIntervalSaga, {
        ...params,
        pingOnlyIfOffline: true,
        pingInterval: 3000,
      });
      saga = takeChannelAndGetConnection(saga, true);
      saga.take('channel');
    });

    it('closes the channel when it ends emitting', () => {
      const mockCloseFn = jest.fn();
      const mockChannel = {
        close: mockCloseFn,
        isConnected: false,
        actionQueue: [],
        isQueuePaused: false,
      };
      const iterator = connectionIntervalSaga({
        ...params,
        pingOnlyIfOffline: true,
        pingInterval: 3000,
      });
      iterator.next();
      // This will make take(mockChannel) throw an error, since it's not a valid
      // channel or a valid pattern for take() inside the infinite loop,
      // hence executing the finally block.
      iterator.next(mockChannel);
      try {
        // @ts-ignore
        iterator.next(true);
        expect(mockCloseFn).toHaveBeenCalled();
        // eslint-disable-next-line
      } catch (e) {}
    });

    it('does NOT close the channel if redux-saga does NOT yield a cancelled effect', () => {
      const mockCloseFn = jest.fn();
      const mockChannel = {
        close: mockCloseFn,
        isConnected: false,
        actionQueue: [],
        isQueuePaused: false,
      };
      const iterator = connectionIntervalSaga({
        ...params,
        pingOnlyIfOffline: true,
        pingInterval: 3000,
      });
      iterator.next();
      // This will make take(mockChannel) throw an error, since it's not a valid
      // channel or a valid pattern for take() inside the infinite loop,
      // hence executing the finally block.
      iterator.next(mockChannel);
      try {
        // @ts-ignore
        iterator.next(false);
        expect(mockCloseFn).not.toHaveBeenCalled();
        // eslint-disable-next-line
      } catch (e) {}
    });
  });

  describe('checkInternetAccessSaga', () => {
    const params = {
      pingServerUrl: args.pingServerUrl,
      pingTimeout: args.pingTimeout,
      httpMethod: args.httpMethod,
      pingInBackground: false,
      customHeaders: args.customHeaders,
    };
    it('returns early if pingInBackground is false AND app state is NOT active', () => {
      AppState.currentState = 'inactive';
      const saga = testSaga(checkInternetAccessSaga, params);
      saga.next().isDone();
    });

    it('calls checkInternetAccess AND handleConnectivityChange', () => {
      params.pingInBackground = true;
      const saga = testSaga(checkInternetAccessSaga, params);
      saga
        .next()
        .call(checkInternetAccess, {
          url: params.pingServerUrl,
          timeout: params.pingTimeout,
          method: params.httpMethod,
          customHeaders: params.customHeaders,
        })
        .next(true)
        .call(handleConnectivityChange, true)
        .next()
        .isDone();
    });
  });

  describe('handleConnectivityChange', () => {
    it('dispatches a CONNECTION_CHANGE action if the connection changed ', () => {
      const actionQueue = ['foo', 'bar'];
      // @ts-ignore
      const saga = testSaga(handleConnectivityChange, false);
      saga
        .next()
        .select(networkSelector)
        .next({ actionQueue, isConnected: true })
        .put(connectionChange(false))
        .next()
        .isDone();
    });

    it('does NOT dispatch if connection did NOT change and we are offline', () => {
      const actionQueue = ['foo', 'bar'];
      // @ts-ignore
      const saga = testSaga(handleConnectivityChange, false);
      saga
        .next()
        .select(networkSelector)
        .next({ actionQueue, isConnected: false })
        .isDone();
    });
  });
});
