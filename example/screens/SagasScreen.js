import React from 'react';
import { Image, Platform, StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import ReduxNetworkReader from '../components/ReduxNetworkReader';
import Counter from '../components/Counter';
import ActionButtons from '../components/ActionButtons';
import OfflineQueue from '../components/OfflineQueue';
import createStore from '../redux/createStore';

const store = createStore({ withSaga: true });

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Sagas',
  };

  render() {
    return (
      <Provider store={store}>
        <View style={styles.container}>
          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/images/redux-saga.png')}
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.getStartedContainer}>
            <Text
              style={{
                marginTop: 10,
                fontSize: 17,
                color: 'purple',
                marginBottom: 30,
              }}
            >
              For sagas example, you have to disconnect your Internet manually
            </Text>
            <ReduxNetworkReader />
            <Counter />
            <ActionButtons />
          </View>
          <View style={styles.tabBarInfoContainer}>
            <OfflineQueue />
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
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
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
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
