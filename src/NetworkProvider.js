/* @flow */
import React, { createContext, Component } from 'react';
import { ReduxContext } from 'redux';
import { AppState, NetInfo, Platform } from 'react-native';
import type { HTTPMethod } from './types';
import {
  clearConnectivityCheckInterval,
  setupConnectivityCheckInterval,
} from './checkConnectivityInterval';
import checkInternetAccess from './checkInternetAccess';
import { connectionChange } from './actionCreators';

const NetworkContext = createContext();

type State = {
  isConnected: boolean,
};

type Props = {
  withRedux?: boolean,
  timeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
};

function validateProps(props: Props) {
  if (typeof props.withRedux !== 'boolean') {
    throw new Error('you should pass a boolean as withRedux parameter');
  }
  if (typeof props.timeout !== 'number') {
    throw new Error('you should pass a number as timeout parameter');
  }
  if (typeof props.pingServerUrl !== 'string') {
    throw new Error('you should pass a string as pingServerUrl parameter');
  }
  if (typeof props.shouldPing !== 'boolean') {
    throw new Error('you should pass a boolean as shouldPing parameter');
  }
  if (typeof props.pingInterval !== 'number') {
    throw new Error('you should pass a number as pingInterval parameter');
  }
  if (typeof props.pingOnlyIfOffline !== 'boolean') {
    throw new Error('you should pass a boolean as pingOnlyIfOffline parameter');
  }
  if (typeof props.pingInBackground !== 'boolean') {
    throw new Error('you should pass a string as pingServerUrl parameter');
  }
  if (typeof !['HEAD', 'OPTIONS'].includes(props.httpMethod)) {
    throw new Error('httpMethod parameter should be either HEAD or OPTIONS');
  }
}

class NetworkProvider extends Component<void, Props, State> {
  static contextType = ReduxContext;
  static defaultProps = {
    withRedux: false,
    timeout: 3000,
    pingServerUrl: 'https://www.google.com/',
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: true,
    pingInBackground: false,
    httpMethod: 'HEAD',
  };

  constructor(props: Props) {
    super(props);
    validateProps(props);
    this.state = {
      isConnected: this.getNetworkState(),
    };
  }

  async componentDidMount() {
    const { pingInterval } = this.props;
    const handler = this.connectionChangeHandler;

    NetInfo.isConnected.addEventListener('connectionChange', handler);
    // On Android the listener does not fire on startup
    if (Platform.OS === 'android') {
      const netConnected = await NetInfo.isConnected.fetch();
      handler(netConnected);
    }

    if (pingInterval > 0) {
      setupConnectivityCheckInterval(this.intervalHandler, pingInterval);
    }
  }

  componentWillUnmount() {
    const handler = this.connectionChangeHandler;
    NetInfo.isConnected.removeEventListener('connectionChange', handler);
    clearConnectivityCheckInterval();
  }

  getNetworkState() {
    const { withRedux } = this.props;
    const store = this.context;
    if (withRedux && store) {
      return store.getState().network.isConnected;
    }
    return this.state ? this.state.isConnected : true;
  }

  get connectionChangeHandler() {
    return this.props.shouldPing
      ? this.handleNetInfoChange
      : this.handleConnectivityChange;
  }

  handleNetInfoChange = (isConnected: boolean) => {
    if (!isConnected) {
      this.handleConnectivityChange(isConnected);
    } else {
      this.checkInternet();
    }
  };

  checkInternet = async () => {
    const { pingInBackground, timeout, pingServerUrl, httpMethod } = this.props;
    if (pingInBackground === false && AppState.currentState !== 'active') {
      return; // <-- Return early as we don't care about connectivity if app is not in foreground.
    }
    const hasInternetAccess = await checkInternetAccess(
      timeout,
      pingServerUrl,
      httpMethod,
    );
    this.handleConnectivityChange(hasInternetAccess);
  };

  intervalHandler = () => {
    const isConnected = this.getNetworkState();
    if (!(isConnected && this.props.pingOnlyIfOffline)) {
      this.checkInternet();
    }
  };

  /**
   * This is the last handler executed on the journey of verifying internet connection
   * @param isConnected
   */
  handleConnectivityChange = (isConnected: boolean) => {
    const store = this.context;
    if (
      typeof store === 'object' &&
      typeof store.dispatch === 'function' &&
      this.props.withRedux === true
    ) {
      const actionQueue = store.getState().network.actionQueue;

      if (isConnected !== store.getState().network.isConnected) {
        store.dispatch(connectionChange(isConnected));
      }
      // dispatching queued actions in order of arrival (if we have any)
      if (isConnected && actionQueue.length > 0) {
        actionQueue.forEach((action: *) => {
          store.dispatch(action);
        });
      }
    }
    this.setState({
      isConnected,
    });
  };

  render() {
    return (
      <NetworkContext.Provider value={this.state.isConnected}>
        {this.props.children}
      </NetworkContext.Provider>
    );
  }
}

export default NetworkProvider;
