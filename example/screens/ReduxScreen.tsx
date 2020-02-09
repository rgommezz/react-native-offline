import React from 'react';
import { Platform, View, StyleSheet, Image } from 'react-native';
import { Provider } from 'react-redux';
import { ReduxNetworkProvider } from 'react-native-offline';

import ConnectionToggler from '../components/ConnectionToggler';
import DummyNetworkContext from '../DummyNetworkContext';
import createStore from '../redux/createStore';
import ReduxNetworkReader from '../components/ReduxNetworkReader';
import Counter from '../components/Counter';
import OfflineQueue from '../components/OfflineQueue';
import ActionButtons from '../components/ActionButtons';

const store = createStore({ queueReleaseThrottle: 1000 });

export default class ReduxScreen extends React.Component {
  static navigationOptions = {
    title: 'Redux',
  };

  render() {
    return (
      <Provider store={store}>
        <DummyNetworkContext.Consumer>
          {({ pingUrl }) => (
            <ReduxNetworkProvider pingServerUrl={pingUrl}>
              <View style={styles.container}>
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../assets/images/redux.png')}
                    style={styles.image}
                  />
                </View>

                <View style={{ marginHorizontal: 50 }}>
                  <ConnectionToggler />
                </View>
                <View style={styles.firstSection}>
                  <ReduxNetworkReader />
                  <Counter />
                </View>
                <View style={styles.secondSection}>
                  <ActionButtons />
                  <View style={styles.offlineQueue}>
                    <OfflineQueue title="Offline Queue (FIFO), throttle = 1s" />
                  </View>
                </View>
              </View>
            </ReduxNetworkProvider>
          )}
        </DummyNetworkContext.Consumer>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  firstSection: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  secondSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  offlineQueue: {
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3, width: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    backgroundColor: '#fbfbfb',
    paddingTop: 10,
  },
});
