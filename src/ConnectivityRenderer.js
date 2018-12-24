/* @flow */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { NetInfo, Platform } from 'react-native';
import checkInternetAccess from './checkInternetAccess';
import reactConnectionStore from './reactConnectionStore';

type DefaultProps = {
  timeout?: number,
  pingServerUrl?: string,
  withExtraHeadRequest?: boolean,
};

type Props = DefaultProps & {
  children: JSX.Element,
};

type State = {
  isConnected: boolean,
};

class ConnectivityRenderer extends Component<DefaultProps, Props, State> {
  static propTypes = {
    children: PropTypes.element.isRequired,
    timeout: PropTypes.number,
    renderDisconnectedComponented: PropTypes.element.isRequired,
    pingServerUrl: PropTypes.string,
    withExtraHeadRequest: PropTypes.bool,
  };

  static defaultProps: DefaultProps = {
    timeout: 3000,
    pingServerUrl: 'https://www.google.com/',
    withExtraHeadRequest: true,
  };

  state = {
    isConnected: reactConnectionStore.getConnection(),
  };

  componentWillMount() {
    if (!React.isValidElement(this.props.children)) {
      throw new Error('You should pass a element as a children');
    }
    if (typeof this.props.timeout !== 'number') {
      throw new Error('you should pass a number as timeout prop');
    }
    if (typeof this.props.pingServerUrl !== 'string') {
      throw new Error('you should pass a string as pingServerUrl prop');
    }
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.props.withExtraHeadRequest
        ? this.checkInternet
        : this.handleConnectivityChange,
    );
    // On Android the listener does not fire on startup
    if (Platform.OS === 'android') {
      NetInfo.isConnected.fetch().then((isConnected: boolean) => {
        if (this.props.withExtraHeadRequest) {
          this.checkInternet(isConnected);
        } else {
          this.handleConnectivityChange(isConnected);
        }
      });
    }
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.props.withExtraHeadRequest
        ? this.checkInternet
        : this.handleConnectivityChange,
    );
  }

  checkInternet = (isConnected: boolean) => {
    if (isConnected) {
      checkInternetAccess(this.props.timeout, this.props.pingServerUrl).then(
        (hasInternetAccess: boolean) => {
          this.handleConnectivityChange(hasInternetAccess);
        },
      );
    } else {
      this.handleConnectivityChange(isConnected);
    }
  };

  handleConnectivityChange = (isConnected: boolean) => {
    reactConnectionStore.setConnection(isConnected);
    if (isConnected !== this.state.isConnected) {
      this.setState({
        isConnected,
      });
    }
  };

  render() {
    return this.state.isConnected && this.props.renderDisconnectedComponented ? 
      this.props.renderDisconnectedComponented() : this.props.children();
  }
}

export default ConnectivityRenderer;
