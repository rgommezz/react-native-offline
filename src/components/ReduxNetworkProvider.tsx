import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import NetworkConnectivity from './NetworkConnectivity';
import { connectionChange } from '../redux/actionCreators';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../utils/constants';
import { NetworkState, ConnectivityArgs } from '../types';

interface AppState {
  network: Partial<NetworkState>;
}

type OwnProps = Partial<ConnectivityArgs>;

interface StateProps {
  isConnected: boolean;
  dispatch: Dispatch;
}

type Props = OwnProps & StateProps;
class ReduxNetworkProvider extends React.Component<Props> {
  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, dispatch } = this.props;
    if (isConnected !== wasConnected) {
      dispatch(connectionChange(isConnected));
    }
  };

  render() {
    const {
      children,
      pingTimeout = DEFAULT_TIMEOUT,
      pingServerUrl = DEFAULT_PING_SERVER_URL,
      shouldPing = true,
      pingInterval = 0,
      pingOnlyIfOffline = false,
      pingInBackground = false,
      httpMethod = DEFAULT_HTTP_METHOD,
    } = this.props;
    const passDownProps: OwnProps = {
      pingTimeout,
      pingServerUrl,
      shouldPing,
      pingInterval,
      pingOnlyIfOffline,
      pingInBackground,
      httpMethod,
    };
    return (
      <NetworkConnectivity
        {...this.props}
        {...passDownProps}
        onConnectivityChange={this.handleConnectivityChange}
      >
        {() => children}
      </NetworkConnectivity>
    );
  }
}

const mapStateToProps = (state: AppState, _?: OwnProps) => ({
  isConnected: !!state.network.isConnected,
});

const ConnectedReduxNetworkProvider = connect(mapStateToProps)(
  ReduxNetworkProvider,
);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps,
};
