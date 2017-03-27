import { Component, PropTypes } from 'react';
import { NetInfo } from 'react-native';
import isNetworkConnected from './isNetworkConnected';

class ConnectivityRenderer extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  };

  state = {
    isConnected: true,
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      'change',
      this.handleConnectivityChange
    );
    // If user is not using the networkHOC, no harm in the below call. handleFirstConnectivityChange will fire
    // as soon as the component mounts, setting the right connectivity, hence re-rendering child components
    const isConnected = isNetworkConnected();
    if (isConnected !== this.state.isConnected) {
      this.setState({  // eslint-disable-line react/no-did-mount-set-state
        isConnected,
      });
    }
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'change',
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange = (isConnected) => {
    if (isConnected !== this.state.isConnected) {
      this.setState({
        isConnected,
      });
    }
  };

  render() {
    return this.props.children(this.state.isConnected);
  }
}

export default ConnectivityRenderer;
