import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NetInfo } from 'react-native';
import { CONNECTION_CHANGE } from './reducer';
import { setInternetConnectivity } from './isNetworkConnected';

const withNetwork = ({ withRedux = true } = {}) =>
  (WrappedComponent) => {
    class EnhancedComponent extends Component {
      static displayName = `networkHOC(${WrappedComponent.displayName})`;

      componentDidMount() {
        NetInfo.isConnected.addEventListener('change', this.handleConnectivityChange);
      }

      componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('change', this.handleConnectivityChange);
      }

      handleConnectivityChange = (isConnected) => {
        // This is triggered on startup as well, so we can detect the connection on initialization in both Android and iOS
        setInternetConnectivity(isConnected);
        if (withRedux) {
          this.props.dispatch({
            type: CONNECTION_CHANGE,
            payload: isConnected,
          });
        }
      };

      render() {
        return <WrappedComponent {...this.props} />;
      }
    }
    return withRedux ? connect()(EnhancedComponent) : EnhancedComponent;
  };

export default withNetwork;
