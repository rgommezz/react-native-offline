import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import MainTabNavigator from './navigation/MainTabNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

export default function App() {
  const [pingUrl, setPingUrl] = useState(onlineUrl);
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const network = useMemo(
    () => ({
      pingUrl,
      toggleConnection: () =>
        setPingUrl(current => (current === onlineUrl ? offlineUrl : onlineUrl)),
    }),
    [pingUrl],
  );

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <DummyNetworkContext.Provider value={network}>
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <MainTabNavigator />
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
