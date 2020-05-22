import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import NetworkConnectivity from './NetworkConnectivity';
import { connectionChange } from '../redux/actionCreators';

import { NetworkState, ConnectivityArgs } from '../types';
import { DEFAULT_ARGS } from '../utils/constants';

interface AppState {
  network: NetworkState;
}

type OwnProps = ConnectivityArgs;

interface StateProps {
  isConnected: boolean;
  dispatch: Dispatch;
}

type Props = OwnProps &
  StateProps & {
    children: React.ReactNode;
  };
class ReduxNetworkProvider extends React.Component<Props> {
  static defaultProps = DEFAULT_ARGS;

  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, dispatch } = this.props;
    if (isConnected !== wasConnected) {
      dispatch(connectionChange(isConnected));
    }
  };

  render() {
    const { children, ...rest } = this.props;
    return (
      <NetworkConnectivity
        {...rest}
        onConnectivityChange={this.handleConnectivityChange}
      >
        {() => children}
      </NetworkConnectivity>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  isConnected: state.network.isConnected,
});

const ConnectedReduxNetworkProvider = connect(mapStateToProps)(
  ReduxNetworkProvider,
);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps,
};
