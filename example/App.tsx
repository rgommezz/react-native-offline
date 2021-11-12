import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

const App = (): JSX.Element => {
  const [isLoading, setLoading] = useState(false);
  const [network, setNetwork] = useState(null);

  const toggleConnection = (): void => {
    setNetwork(network === onlineUrl ? offlineUrl : onlineUrl);
  };

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    setLoading(true);
    setNetwork(onlineUrl);
  });

  if (!fontsLoaded || !isLoading) {
    return <AppLoading />;
  }

  return (
    <DummyNetworkContext.Provider
      value={{
        toggleConnection: (): void => toggleConnection(),
        pingUrl: network,
      }}
    >
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppNavigator />
      </View>
      //{' '}
    </DummyNetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
