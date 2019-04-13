/* @flow */
import * as React from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import type { HTTPMethod, State } from '../types';
import * as connectivityInterval from '../utils/checkConnectivityInterval';
import checkInternetAccess from '../utils/checkInternetAccess';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_TIMEOUT,
  DEFAULT_PING_SERVER_URL,
} from '../utils/constants';

export type RequiredProps = {
  children: (state: State) => React.Node,
};

export type DefaultProps = {
  onConnectivityChange: (isConnected: boolean) => void,
  pingTimeout: number,
  pingServerUrl: string,
  shouldPing: boolean,
  pingInterval: number,
  pingOnlyIfOffline: boolean,
  pingInBackground: boolean,
  httpMethod: HTTPMethod,
};

type Props = RequiredProps & DefaultProps;

function validateProps(props: Props) {
  if (typeof props.onConnectivityChange !== 'function') {
    throw new Error(
      'you should pass a function as onConnectivityChange parameter',
    );
  }
  if (typeof props.pingTimeout !== 'number') {
    throw new Error('you should pass a number as pingTimeout parameter');
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

class NetworkConnectivity extends React.PureComponent<Props, State> {
  static defaultProps = {
    onConnectivityChange: () => undefined,
    pingTimeout: DEFAULT_TIMEOUT,
    pingServerUrl: DEFAULT_PING_SERVER_URL,
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: false,
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

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { pingServerUrl, onConnectivityChange } = this.props;
    const { isConnected } = this.state;
    if (prevProps.pingServerUrl !== pingServerUrl) {
      this.checkInternet();
    }
    if (prevState.isConnected !== isConnected) {
      onConnectivityChange(isConnected);
    }
  }

  componentWillUnmount() {
    const handler = this.getConnectionChangeHandler();
    NetInfo.isConnected.removeEventListener('connectionChange', handler);
    connectivityInterval.clear();
  }

  getConnectionChangeHandler() {
    const { shouldPing } = this.props;
    return shouldPing
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
    const {
      pingInBackground,
      pingTimeout,
      pingServerUrl,
      httpMethod,
    } = this.props;
    if (pingInBackground === false && AppState.currentState !== 'active') {
      return; // <-- Return early as we don't care about connectivity if app is not in foreground.
    }
    const hasInternetAccess = await checkInternetAccess({
      url: pingServerUrl,
      timeout: pingTimeout,
      method: httpMethod,
    });
    this.handleConnectivityChange(hasInternetAccess);
  };

  intervalHandler = () => {
    const { isConnected } = this.state;
    const { pingOnlyIfOffline } = this.props;
    if (isConnected && pingOnlyIfOffline === true) {
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
    const { children } = this.props;
    return children(this.state);
  }
}

export default NetworkConnectivity;
