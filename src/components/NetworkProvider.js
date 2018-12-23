/* @flow */
import React, { PureComponent } from 'react';
import { AppState, NetInfo, Platform } from 'react-native';
import NetworkContext from './NetworkContext';
import type { HTTPMethod } from '../types';
import * as connectivityInterval from '../utils/checkConnectivityInterval';
import checkInternetAccess from '../utils/checkInternetAccess';

type State = {
  isConnected: boolean,
};

type Props = {
  timeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
};

function validateProps(props: Props) {
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
  if (!['HEAD', 'OPTIONS'].includes(props.httpMethod)) {
    throw new Error('httpMethod parameter should be either HEAD or OPTIONS');
  }
}

class NetworkProvider extends PureComponent<void, Props, State> {
  static defaultProps = {
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
      isConnected: true,
    };
  }

  async componentDidMount() {
    const { pingInterval } = this.props;
    const handler = this.getConnectionChangeHandler();

    NetInfo.isConnected.addEventListener('connectionChange', handler);
    // On Android the listener does not fire on startup
    if (Platform.OS === 'android') {
      const netConnected = await NetInfo.isConnected.fetch();
      handler(netConnected);
    }
    if (pingInterval > 0) {
      connectivityInterval.setup(this.intervalHandler, pingInterval);
    }
  }

  componentWillUnmount() {
    const handler = this.getConnectionChangeHandler();
    NetInfo.isConnected.removeEventListener('connectionChange', handler);
    connectivityInterval.clear();
  }

  getConnectionChangeHandler() {
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
    if (this.state.isConnected && this.props.pingOnlyIfOffline === true) {
      return;
    }
    this.checkInternet();
  };

  /**
   * This is the last handler executed on the journey of verifying internet connection
   * @param isConnected
   */
  handleConnectivityChange = (isConnected: boolean) => {
    this.setState({
      isConnected,
    });
  };

  render() {
    return (
      <NetworkContext.Provider value={this.state}>
        {this.props.children}
      </NetworkContext.Provider>
    );
  }
}

export default NetworkProvider;
