import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

interface NetworkState {
  pingUrl: string;
  toggleConnection: () => void;
}

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [pingUrl, setPingUrl] = useState(onlineUrl);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Font loading failed', e);
      } finally {
        if (isMounted) setIsLoadingComplete(true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleConnection = () => {
    setPingUrl(prev => (prev === onlineUrl ? offlineUrl : onlineUrl));
  };

  const network: NetworkState = { pingUrl, toggleConnection };

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <DummyNetworkContext.Provider value={network}>
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppNavigator />
      </View>
    </DummyNetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});