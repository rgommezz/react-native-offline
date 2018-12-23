/* @flow */
import { PureComponent } from 'react';
import { AppState, NetInfo, Platform } from 'react-native';
import type { HTTPMethod } from '../types';
import * as connectivityInterval from '../utils/checkConnectivityInterval';
import checkInternetAccess from '../utils/checkInternetAccess';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_TIMEOUT,
  DEFAULT_PING_SERVER_URL,
} from '../utils/constants';

type State = {
  isConnected: boolean,
};

type Props = {
  onConnectivityChange?: (isConnected: boolean) => void,
  children: *, // TODO add proper type
  timeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
};

function validateProps(props: Props) {
  if (typeof props.onConnectivityChange !== 'function') {
    throw new Error(
      'you should pass a function as onConnectivityChange parameter',
    );
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
  if (!['HEAD', 'OPTIONS'].includes(props.httpMethod)) {
    throw new Error('httpMethod parameter should be either HEAD or OPTIONS');
  }
}

class NetworkConnectivity extends PureComponent<void, Props, State> {
  static defaultProps = {
    onConnectivityChange: () => ({}),
    timeout: DEFAULT_TIMEOUT,
    pingServerUrl: DEFAULT_PING_SERVER_URL,
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: true,
    pingInBackground: false,
    httpMethod: DEFAULT_HTTP_METHOD,
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

  componentDidUpdate(_: *, prevState: State) {
    if (prevState.isConnected !== this.state.isConnected) {
      this.props.onConnectivityChange(this.state.isConnected);
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

  handleConnectivityChange = (isConnected: boolean) => {
    this.setState({
      isConnected,
    });
  };

  render() {
    return this.props.children(this.state);
  }
}

export default NetworkConnectivity;
