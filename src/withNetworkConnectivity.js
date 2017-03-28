import React, { Component, PropTypes } from 'react';
import { NetInfo } from 'react-native';
import { connectionChange } from './actionCreators';
import { setInternetConnectivity } from './isNetworkConnected';

const withNetworkConnectivity = (WrappedComponent) => {
  class EnhancedComponent extends Component {
    static displayName = `withNetworkConnectivity(${WrappedComponent.displayName})`;

    static contextTypes = {
      store: PropTypes.shape({
        dispatch: PropTypes.func,
      }),
    };

    componentDidMount() {
      NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
    }

    componentWillUnmount() {
      NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
    }

    handleConnectivityChange = (isConnected) => {
      const { store } = this.context;
      // This is triggered on startup as well, so we can detect the connection on initialization in both Android and iOS
      setInternetConnectivity(isConnected);
      if (typeof store === 'object' && typeof store.dispatch === 'function') {
        const actionQueue = store.getState().network.actionQueue;
        store.dispatch(connectionChange(isConnected));
        // dispatching queued actions in order of arrival (if we have any)
        if (isConnected && actionQueue.length > 0) {
          actionQueue
            .forEach((action) => {
              store.dispatch(action);
            });
        }
      }
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return EnhancedComponent;
};

export default withNetworkConnectivity;
