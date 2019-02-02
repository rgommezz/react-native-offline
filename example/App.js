import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Font, Icon } from 'expo';
import { NetworkProvider } from 'react-native-offline';
import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
      network: {
        pingUrl: onlineUrl,
        toggleConnection: this.toggleConnection,
      },
    };
  }

  toggleConnection = () => {
    this.setState(prevState => ({
      network: {
        ...prevState.network,
        pingUrl:
          prevState.network.pingUrl === onlineUrl ? offlineUrl : onlineUrl,
      },
    }));
  };

  loadResourcesAsync = async () =>
    Font.loadAsync({
      ...Icon.Ionicons.font,
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
    });

  handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  render() {
    const { isLoadingComplete, network } = this.state;
    const { skipLoadingScreen } = this.props;
    if (!isLoadingComplete && !skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onFinish={this.handleFinishLoading}
        />
      );
    }
    return (
      <DummyNetworkContext.Provider value={network}>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NetworkProvider pingServerUrl={network.pingUrl}>
            <AppNavigator />
          </NetworkProvider>
        </View>
      </DummyNetworkContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
