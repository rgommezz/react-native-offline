/* @flow */

import { Component, PropTypes } from 'react';
import { NetInfo, Platform } from 'react-native';
import checkInternetAccess from './checkInternetAccess';
import reactConnectionStore from './reactConnectionStore';

type Props = {
  children: (isConnected: boolean) => React$Element<any>
};

type State = {
  isConnected: boolean
};

class ConnectivityRenderer extends Component<void, Props, State> {
  static propTypes = {
    children: PropTypes.func.isRequired
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

  checkInternet = (isConnected: boolean) => {
    checkInternetAccess(isConnected).then(hasInternetAccess => {
      this.handleConnectivityChange(hasInternetAccess);
    });
  };

  handleConnectivityChange = (isConnected: boolean) => {
    reactConnectionStore.setConnection(isConnected);
    if (isConnected !== this.state.isConnected) {
      this.setState({
        isConnected
      });
    }
  };

  render() {
    return this.props.children(this.state.isConnected);
  }
}

export default ConnectivityRenderer;
