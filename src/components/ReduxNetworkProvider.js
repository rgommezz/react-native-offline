/* @flow */
import React, { Component } from 'react';
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
  actionQueue: Array<FluxAction>,
  timeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
};

class ReduxNetworkProvider extends Component<void, Props, void> {
  static defaultProps = {
    timeout: DEFAULT_TIMEOUT,
    pingServerUrl: DEFAULT_PING_SERVER_URL,
    shouldPing: true,
    pingInterval: 0,
    pingOnlyIfOffline: false,
    pingInBackground: false,
    httpMethod: DEFAULT_HTTP_METHOD,
  };

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
    return (
      <NetworkConnectivity
        {...this.props}
        onConnectivityChange={this.handleConnectivityChange}
      >
        {() => this.props.children}
      </NetworkConnectivity>
    );
  }
}

function mapStateToProps(state: { network: NetworkState }) {
  return {
    isConnected: state.network.isConnected,
    actionQueue: state.network.actionQueue,
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
