/* @flow */
import { Component } from 'react';
import { connect } from 'react-redux';
import { AppState, NetInfo, Platform } from 'react-native';
import type { HTTPMethod, FluxAction } from './types';
import {
  clearConnectivityCheckInterval,
  setupConnectivityCheckInterval,
} from './checkConnectivityInterval';
import checkInternetAccess from './checkInternetAccess';
import { connectionChange } from './actionCreators';

type Props = {
  dispatch: FluxAction => FluxAction,
  isConnected: boolean,
  actionQueue: Array<FluxAction>,
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
  if (typeof !['HEAD', 'OPTIONS'].includes(props.httpMethod)) {
    throw new Error('httpMethod parameter should be either HEAD or OPTIONS');
  }
}

class ReduxNetworkProvider extends Component<void, Props, void> {
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
    if (!(this.props.isConnected && this.props.pingOnlyIfOffline)) {
      this.checkInternet();
    }
  };

  /**
   * This is the last handler executed on the journey of verifying internet connection
   * @param isConnected
   */
  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, actionQueue, dispatch } = this.props;

    if (isConnected !== wasConnected) {
      dispatch(connectionChange(isConnected));
    }
    // dispatching queued actions in order of arrival (if we have any)
    if (!wasConnected && isConnected && actionQueue.length > 0) {
      actionQueue.forEach((action: *) => {
        dispatch(action);
      });
    }
  };

  render() {
    return this.props.children;
  }
}

export default connect((state: *) => ({
  isConnected: state.network.isConnected,
  actionQueue: state.network.actionQueue,
}))(ReduxNetworkProvider);
