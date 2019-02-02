import React from 'react';
import { Platform, View, StyleSheet, Image, Text, Button } from 'react-native';
import { ReduxNetworkProvider } from 'react-native-offline';
import { Provider } from 'react-redux';

import { MonoText } from '../components/StyledText';
import ConnectionToggler from '../components/ConnectionToggler';
import DummyNetworkContext from '../DummyNetworkContext';
import createStore from '../redux/createStore';
import ReduxNetworkReader from '../components/ReduxNetworkReader';
import Counter from '../components/Counter';
import OfflineQueue from '../components/OfflineQueue';
import ActionButtons from "../components/ActionButtons";

const store = createStore();

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
                <View style={styles.welcomeContainer}>
                  <Image
                    source={require('../assets/images/redux.png')}
                    style={styles.welcomeImage}
                  />
                </View>

                <View style={styles.getStartedContainer}>
                  <ReduxNetworkReader />
                  <Counter />
                  <ConnectionToggler />
                  <ActionButtons />
                </View>
                <View style={styles.tabBarInfoContainer}>
                  <OfflineQueue />
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
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
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
