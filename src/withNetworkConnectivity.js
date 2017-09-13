/* @flow */

import React, { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { connectionChange } from './actionCreators';
import reactConnectionStore from './reactConnectionStore';
import checkInternetAccess from './checkInternetAccess';

type Arguments = {
  withRedux?: boolean,
  timeout?: number,
  pingServerUrl?: string,
};

type State = {
  isConnected: boolean,
};

const withNetworkConnectivity = (
  {
    withRedux = false,
    timeout = 3000,
    pingServerUrl = 'https://google.com',
  }: Arguments = {},
) => (WrappedComponent: ReactClass<*>) => {
  if (typeof withRedux !== 'boolean') {
    throw new Error('you should pass a boolean as withRedux parameter');
  }
  if (typeof timeout !== 'number') {
    throw new Error('you should pass a number as timeout parameter');
  }
  if (typeof pingServerUrl !== 'string') {
    throw new Error('you should pass a string as pingServerUrl parameter');
  }

  class EnhancedComponent extends Component<void, void, State> {
    static displayName = `withNetworkConnectivity(${WrappedComponent.displayName})`;

    static contextTypes = {
      store: PropTypes.shape({
        dispatch: PropTypes.func,
      }),
    };

    state = {
      isConnected: reactConnectionStore.getConnection(),
    };

    componentDidMount() {
      NetInfo.isConnected.addEventListener('connectionChange', this.checkInternet);
      // On Android the listener does not fire on startup
      if (Platform.OS === 'android') {
        NetInfo.isConnected
          .fetch()
          .then((isConnected: boolean) => this.checkInternet(isConnected));
      }
    }

    componentWillUnmount() {
      NetInfo.isConnected.removeEventListener('connectionChange', this.checkInternet);
    }

    checkInternet = (isConnected: boolean) => {
      checkInternetAccess(
        isConnected,
        timeout,
        pingServerUrl,
      ).then((hasInternetAccess: boolean) => {
        this.handleConnectivityChange(hasInternetAccess);
      });
    };

    handleConnectivityChange = (isConnected: boolean) => {
      const { store } = this.context;
      reactConnectionStore.setConnection(isConnected);
      // Top most component, syncing with store
      if (
        typeof store === 'object' &&
        typeof store.dispatch === 'function' &&
        withRedux === true
      ) {
        const actionQueue = store.getState().network.actionQueue;
        store.dispatch(connectionChange(isConnected));
        // dispatching queued actions in order of arrival (if we have any)
        if (isConnected && actionQueue.length > 0) {
          actionQueue.forEach((action: *) => {
            store.dispatch(action);
          });
        }
      } else {
        // Standard HOC, passing connectivity as props
        this.setState({ isConnected });
      }
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          isConnected={!withRedux ? this.state.isConnected : undefined}
        />
      );
    }
  }
  return hoistStatics(EnhancedComponent, WrappedComponent);
};

export default withNetworkConnectivity;
