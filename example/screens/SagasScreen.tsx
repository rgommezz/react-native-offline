import React from 'react';
import { Image, Platform, StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import ReduxNetworkReader from '../components/ReduxNetworkReader';
import Counter from '../components/Counter';
import ActionButtons from '../components/ActionButtons';
import OfflineQueue from '../components/OfflineQueue';
import createStore from '../redux/createStore';

const store = createStore({ withSaga: true, queueReleaseThrottle: 250 });

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Sagas',
  };

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/redux-saga.png')}
              style={styles.image}
            />
          </View>
          <View style={styles.firstSection}>
            <Text
              style={{
                marginTop: 10,
                fontSize: 17,
                color: 'purple',
                marginBottom: 30,
                textAlign: 'center',
              }}
            >
              For sagas example, you have to disconnect your Internet manually
            </Text>
            <ReduxNetworkReader />
            <Counter />
          </View>
          <View style={styles.secondSection}>
            <ActionButtons />
            <View style={styles.offlineQueue}>
              <OfflineQueue title="Offline Queue (FIFO), throttle = 250ms" />
            </View>
          </View>
        </View>
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
