/* @flow */
import { testSaga } from 'redux-saga-test-plan';
import { Platform, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
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
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../src/utils/constants';
import { networkSelector } from '../src/redux/reducer';
import checkInternetAccess from '../src/utils/checkInternetAccess';

const args = {
  pingTimeout: DEFAULT_TIMEOUT,
  pingServerUrl: DEFAULT_PING_SERVER_URL,
  shouldPing: true,
  pingInterval: 0,
  pingOnlyIfOffline: false,
  pingInBackground: false,
  httpMethod: DEFAULT_HTTP_METHOD,
};

describe('sagas', () => {
  describe('networkSaga', () => {
    it('forks netInfoChangeSaga with the right params', () => {
      const { pingInterval, ...params } = args;
      testSaga(networkSaga, params)
        .next()
        .fork(netInfoChangeSaga, params)
        .next()
        .isDone();
    });

    it(`forks netInfoChangeSaga AND sets an interval 
    if pingInterval is higher than 0`, () => {
      const { shouldPing, pingInterval, ...params } = args;
      testSaga(networkSaga, { ...args, pingInterval: 3000 })
        .next()
        .fork(netInfoChangeSaga, { ...params, shouldPing })
        .next()
        .fork(connectionIntervalSaga, { ...params, pingInterval: 3000 })
        .next()
        .isDone();
    });

    it('default parameters', () => {
      const { shouldPing, pingInterval, ...params } = args;
      testSaga(networkSaga)
        .next()
        .fork(netInfoChangeSaga, { ...params, shouldPing })
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
    };
    function channelLoop(saga) {
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
      const saga = testSaga(netInfoChangeSaga, params);
      channelLoop(saga);
    });

    it('Android', () => {
      Platform.OS = 'android';
      const saga = testSaga(netInfoChangeSaga, params)
        .next()
        .call([NetInfo, NetInfo.isConnected.fetch])
        .next(false)
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
      iterator.next(mockChannel);
      try {
        iterator.next(true);
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
      iterator.next(mockChannel);
      try {
        iterator.next(false);
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
    };
    it('forks checkInternetAccessSaga if shouldPing AND isConnected are true', () => {
      const saga = testSaga(connectionHandler, params);
      saga
        .next()
        .fork(checkInternetAccessSaga, {
          pingTimeout: args.pingTimeout,
          pingServerUrl: args.pingServerUrl,
          httpMethod: args.httpMethod,
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
    function takeChannelAndGetConnection(saga, isConnected) {
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
      let saga = testSaga(connectionIntervalSaga, {
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
        })
        .next()
        .take('channel');
    });

    it(`does NOT fork checkInternetAccessSaga if it's connected 
    AND pingOnlyIfOffline is true`, () => {
      let saga = testSaga(connectionIntervalSaga, {
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
        iterator.next(true);
        expect(mockCloseFn).toHaveBeenCalled();
        // eslint-disable-next-line
      } catch (e) {}
    });

    it('does NOT close the channel if redux-saga does NOT yield a cancelled effect', () => {
      const mockCloseFn = jest.fn();
      const mockChannel = {
        close: mockCloseFn,
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
      const saga = testSaga(handleConnectivityChange, false);
      saga
        .next()
        .select(networkSelector)
        .next({ actionQueue, isConnected: false })
        .isDone();
    });
  });
});
