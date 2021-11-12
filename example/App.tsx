import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import AppNavigator from './navigation/AppNavigator';
import DummyNetworkContext from './DummyNetworkContext';

const onlineUrl = 'https://www.google.com/';
const offlineUrl = 'https://www.weifhweopfhwioehfiwoephfpweoifhewifhpewoif.com';
interface Props {
  skipLoadingScreen?: boolean;
}

interface State {
  isLoadingComplete: boolean;
  network: {
    pingUrl: string;
    toggleConnection: () => void;
  };
}

const App = () => {

  // const { isLoadingComplete, network } = this.state;
  // const { skipLoadingScreen } = this.props;

  // const [isLoadingComplete, setLoadingComplete ] = useState()


  // constructor(props: Props) {
  //   super(props);
  //   this.state = {
  //     isLoadingComplete: false,
  //     network: {
  //       pingUrl: onlineUrl,
  //       toggleConnection: this.toggleConnection,
  //     },
  //   };
  // }

  // async componentDidMount() {
  //   this.setState({ isLoadingComplete: true });
  // }



  // toggleConnection = () => {
  //   this.setState(prevState => ({
  //     network: {
  //       ...prevState.network,
  //       pingUrl:
  //         prevState.network.pingUrl === onlineUrl ? offlineUrl : onlineUrl,
  //     },
  //   }));
  // };

  // if (!isLoadingComplete && !skipLoadingScreen) {
  //   return null;
  // }

  let [fontsLoaded] = useFonts({
    ...Ionicons.font,
    'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {


  return (
    // <DummyNetworkContext.Provider value={network}>
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <AppNavigator />
      </View>
    // </DummyNetworkContext.Provider>
  );
   
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
