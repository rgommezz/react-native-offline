/* @flow */

import React, { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { connectionChange } from './actionCreators';
import reactConnectionStore from './reactConnectionStore';
import checkInternetAccess from './checkInternetAccess';

const withNetworkConnectivity = (withConnectivityProp: boolean = true) => (
  WrappedComponent: Class<React$Component<*, *, *>>
) => {
  if (typeof withConnectivityProp !== 'boolean')
    throw new Error('you should pass a boolean as withConnectivityProp');

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
      checkInternetAccess(isConnected).then(hasInternetAccess => {
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
        withConnectivityProp === false
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
          isConnected={
            withConnectivityProp ? this.state.isConnected : undefined
          }
        />
      );
    }
  }
  return hoistStatics(EnhancedComponent, WrappedComponent);
};

export default withNetworkConnectivity;
