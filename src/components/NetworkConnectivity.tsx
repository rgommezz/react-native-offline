import * as React from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as connectivityInterval from '../utils/checkConnectivityInterval';
import checkInternetAccess from '../utils/checkInternetAccess';
import { ConnectivityArgs } from '../types';
import { ConnectivityState } from './NetworkContext';
import DEFAULT_ARGS from '../utils/defaultConnectivityArgs';

export type RequiredProps = {
  children: (state: ConnectivityState) => React.ReactNode;
} & Partial<DefaultProps>;

export type DefaultProps = ConnectivityArgs & {
  onConnectivityChange: (isConnected: boolean) => void;
};

function validateProps(props: RequiredProps) {
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
  if (props.httpMethod && !['HEAD', 'OPTIONS'].includes(props.httpMethod)) {
    throw new Error('httpMethod parameter should be either HEAD or OPTIONS');
  }
}

const defaultProps = {
  ...DEFAULT_ARGS,
  onConnectivityChange: () => undefined,
};
class NetworkConnectivity extends React.PureComponent<
  RequiredProps,
  ConnectivityState
> {
  static defaultProps = defaultProps;

  constructor(props: RequiredProps) {
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
    if (pingInterval && pingInterval > 0) {
      connectivityInterval.setup(this.intervalHandler, pingInterval);
    }
  }

  componentDidUpdate(prevProps: RequiredProps, prevState: ConnectivityState) {
    const { pingServerUrl, onConnectivityChange } = this.props;
    const { isConnected } = this.state;
    if (prevProps.pingServerUrl !== pingServerUrl) {
      this.checkInternet();
    }
    if (onConnectivityChange && prevState.isConnected !== isConnected) {
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
