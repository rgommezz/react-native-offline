import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { NetworkProvider, NetworkConsumer } from 'react-native-offline';

import { MonoText } from '../components/StyledText';
import ConnectionToggler from '../components/ConnectionToggler';
import DummyNetworkContext from '../DummyNetworkContext';

export default class ComponentsScreen extends React.Component {
  static navigationOptions = {
    title: 'Components',
  };

  render() {
    return (
      <DummyNetworkContext.Consumer>
        {({ pingUrl }) => (
          <NetworkProvider pingServerUrl={pingUrl}>
            <View style={styles.container}>
              <View style={styles.imageContainer}>
                <Image
                  source={require('../assets/images/robot-dev.png')}
                  style={styles.image}
                />
              </View>
              <View style={{ marginHorizontal: 50 }}>
                <ConnectionToggler />
              </View>
              <View style={styles.firstSectionContainer}>
                <Text style={styles.firstSectionText}>
                  Connected to Internet:
                </Text>

                <NetworkConsumer>
                  {({ isConnected }) => (
                    <View
                      style={[styles.codeHighlightContainer, styles.filename]}
                    >
                      <MonoText
                        style={[
                          styles.codeHighlightText,
                          { color: isConnected ? 'green' : 'red' },
                        ]}
                      >
                        {isConnected ? 'YES' : 'NO'}
                      </MonoText>
                    </View>
                  )}
                </NetworkConsumer>
              </View>

              <View style={styles.tabBarInfoContainer}>
                <Text style={styles.tabBarInfoText}>
                  An example using merely components from
                </Text>

                <View
                  style={[
                    styles.codeHighlightContainer,
                    styles.navigationFilename,
                  ]}
                >
                  <MonoText style={styles.codeHighlightText}>
                    react-native-offline
                  </MonoText>
                </View>
              </View>
            </View>
          </NetworkProvider>
        )}
      </DummyNetworkContext.Consumer>
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
  firstSectionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filename: {
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
  firstSectionText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 8,
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
