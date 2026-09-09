import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';

export default function App() {
  const [pingUrl, setPingUrl] = useState(onlineUrl);

  const toggleConnection = useCallback(() => {
    setPingUrl((prev) => (prev === onlineUrl ? offlineUrl : onlineUrl));
  }, []);

  const networkValue = useMemo(
    () => ({ pingUrl, toggleConnection }),
    [pingUrl, toggleConnection]
  );

  return (
    <DummyNetworkContext.Provider value={networkValue}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </DummyNetworkContext.Provider>
  );
}
