import * as React from "react";
import { connect } from "react-redux";
import NetworkConnectivity from "./NetworkConnectivity";
import { connectionChange } from "../redux/actionCreators";
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT
} from "../utils/constants";
import { NetworkState, ConnectivityArgs } from "../types";
import { ActionCreator } from "redux";

interface AppState {
  network: Partial<NetworkState>;
}

type OwnProps = Partial<ConnectivityArgs>;

interface StateProps {
  isConnected: boolean;
}

interface DispatchProps {
  connectionChange: ActionCreator<ReturnType<typeof connectionChange>>;
}

type Props = OwnProps & StateProps & DispatchProps;
class ReduxNetworkProvider extends React.Component<Props> {
  handleConnectivityChange = (isConnected: boolean) => {
    const { isConnected: wasConnected, connectionChange } = this.props;
    if (isConnected !== wasConnected) {
      connectionChange(isConnected);
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
      httpMethod = DEFAULT_HTTP_METHOD
    } = this.props;
    const passDownProps: OwnProps = {
      pingTimeout,
      pingServerUrl,
      shouldPing,
      pingInterval,
      pingOnlyIfOffline,
      pingInBackground,
      httpMethod
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

const mapStateToProps = (state: AppState, _?: OwnProps): StateProps => ({
  isConnected: !!state.network.isConnected
});
const mapDispatchToProps: DispatchProps = { connectionChange };

const ConnectedReduxNetworkProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(ReduxNetworkProvider);

export {
  ConnectedReduxNetworkProvider as default,
  ReduxNetworkProvider,
  mapStateToProps
};
