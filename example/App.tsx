import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already prevented or not available in this environment */
});

const onlineUrl = 'https://www.google.com/';
const offlineUrl =
  'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

export default function App() {
  const [pingUrl, setPingUrl] = useState(onlineUrl);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  const network = useMemo(
    () => ({
      pingUrl,
      toggleConnection: () =>
        setPingUrl(current =>
          current === onlineUrl ? offlineUrl : onlineUrl,
        ),
    }),
    [pingUrl],
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <DummyNetworkContext.Provider value={network}>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <AppNavigator />
        </View>
      </DummyNetworkContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
