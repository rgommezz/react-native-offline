/* @flow */

import React, { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { connectionChange } from './actionCreators';
import reactConnectionStore from './reactConnectionStore';
import checkInternetAccess from './checkInternetAccess';

type Arguments = {|
  withRedux: boolean,
  timeout: 3000,
  pingServerUrl: string
|};

const withNetworkConnectivity = (
  {
    withRedux = false,
    timeout = 3000,
    pingServerUrl = 'https://google.com'
  }: Arguments = {}
) => (WrappedComponent: Class<React$Component<*, *, *>>) => {
  if (typeof withRedux !== 'boolean') {
    throw new Error('you should pass a boolean as withRedux parameter');
  }
  if (typeof timeout !== 'number') {
    throw new Error('you should pass a number as timeout parameter');
  }
  if (typeof pingServerUrl !== 'string') {
    throw new Error('you should pass a string as pingServerUrl parameter');
  }

  class EnhancedComponent extends Component {
    static displayName = `withNetworkConnectivity(${WrappedComponent.displayName})`;

    static contextTypes = {
      store: PropTypes.shape({
        dispatch: PropTypes.func
      })
    };

    state = {
      isConnected: reactConnectionStore.getConnection()
    };

    componentDidMount() {
      NetInfo.isConnected.addEventListener('change', this.checkInternet);
      // On Android the listener does not fire on startup
      if (Platform.OS === 'android') {
        NetInfo.isConnected
          .fetch()
          .then(isConnected => this.checkInternet(isConnected));
      }
    }

    componentWillUnmount() {
      NetInfo.isConnected.removeEventListener('change', this.checkInternet);
    }

    checkInternet = isConnected => {
      checkInternetAccess(
        isConnected,
        timeout,
        pingServerUrl
      ).then(hasInternetAccess => {
        this.handleConnectivityChange(hasInternetAccess);
      });
    };

    handleConnectivityChange = isConnected => {
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
          actionQueue.forEach(action => {
            store.dispatch(action);
          });
        }
      } else {
        // Standard HOC, passing connectivity as props
        this.setState({
          isConnected
        });
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
