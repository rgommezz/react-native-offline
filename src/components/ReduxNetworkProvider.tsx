/* @flow */
import * as React from 'react';
import { connect } from 'react-redux';
import NetworkConnectivity from './NetworkConnectivity';
import type { HTTPMethod, FluxAction, NetworkState } from '../types';
import { connectionChange } from '../redux/actionCreators';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../utils/constants';

type Props = {
  dispatch: FluxAction => FluxAction,
  isConnected: boolean,
  pingTimeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
  children: React.Node,
};

class ReduxNetworkProvider extends React.Component<Props> {
  static defaultProps = {
    pingTimeout: DEFAULT_TIMEOUT,
    pingServerUrl: DEFAULT_PING_SERVER_URL,
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: false,
    pingInBackground: false,
    httpMethod: DEFAULT_HTTP_METHOD,
  };

  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, dispatch } = this.props;
    if (isConnected !== wasConnected) {
      dispatch(connectionChange(isConnected));
    }
  };

  render() {
    const { children } = this.props;
    return (
      <NetworkConnectivity
        {...this.props}
        onConnectivityChange={this.handleConnectivityChange}
      >
        {() => children}
      </NetworkConnectivity>
    );
  }
}

function mapStateToProps(state: { network: NetworkState }) {
  return {
    isConnected: state.network.isConnected,
  };
}

const ConnectedReduxNetworkProvider = connect(mapStateToProps)(
  ReduxNetworkProvider,
);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps,
};
