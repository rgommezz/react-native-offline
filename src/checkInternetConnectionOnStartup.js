/* @flow */

import { Platform, NetInfo } from 'react-native';
import checkInternetAccess from './checkInternetAccess';

// on iOS, the listener is fired immediately after registration
// on Android, we need to use `isConnected.fetch`, that returns a promise which resolves with a boolean
export default function checkInternetConnectionOnStartup(
  timeout: number = 3000,
  url: string = 'https://google.com'
): Promise<boolean> {
  if (Platform.OS === 'ios') {
    var connectionChecked = new Promise(resolve => {
      const handleFirstConnectivityChangeIOS = isConnected => {
        NetInfo.isConnected.removeEventListener( // Cleaning up after initial detection
          'connectionChange',
          handleFirstConnectivityChangeIOS,
        );
        resolve(isConnected);
      };
      NetInfo.isConnected.addEventListener(
        'connectionChange',
        handleFirstConnectivityChangeIOS,
      );
    });
  } else {
    var connectionChecked = NetInfo.isConnected.fetch();
  }

  return connectionChecked.then(isConnected => {
    return (isConnected ? checkInternetAccess(timeout, url) : Promise.resolve(false));
  });
}
