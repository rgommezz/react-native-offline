import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { NetInfoStateType } from '@react-native-community/netinfo';
import NetworkConnectivity from './NetworkConnectivity';
import { connectionChange } from '../redux/actionCreators';

import { NetworkState, ConnectivityArgs, ConnectivityState } from '../types';
import { DEFAULT_ARGS } from '../utils/constants';

interface AppState {
  network: NetworkState;
}

type OwnProps = ConnectivityArgs;

interface StateProps {
  isConnected: boolean | null;
  type?: NetInfoStateType;
  dispatch: Dispatch;
}

type Props = OwnProps &
  StateProps & {
    children: React.ReactNode;
  };
class ReduxNetworkProvider extends React.Component<Props> {
  static defaultProps = DEFAULT_ARGS;

  handleConnectivityChange = ({ isConnected, type }: ConnectivityState) => {
    const { isConnected: wasConnected, type: prevType, dispatch } = this.props;
    if (isConnected !== wasConnected || type !== prevType) {
      dispatch(connectionChange({ isConnected, type }));
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
  type: state.network.type,
});

const ConnectedReduxNetworkProvider = connect(mapStateToProps)(
  ReduxNetworkProvider,
);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps,
};
