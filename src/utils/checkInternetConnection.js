/* @flow */

import { Platform, NetInfo } from 'react-native';
import checkInternetAccess from './checkInternetAccess';
import { DEFAULT_PING_SERVER_URL, DEFAULT_TIMEOUT } from './constants';

/**
 * Utility that allows to query for internet connectivity on demand
 * On iOS, the listener is fired immediately after registration
 * On Android, we need to use `isConnected.fetch`, that returns a promise which resolves with a boolean
 * @param timeout
 * @param url
 * @returns {Promise<boolean>}
 */
export default function checkInternetConnection(
  timeout: number = DEFAULT_TIMEOUT,
  url: string = DEFAULT_PING_SERVER_URL,
): Promise<boolean> {
  let connectionChecked: Promise<boolean>;
  if (Platform.OS === 'ios') {
    connectionChecked = new Promise((resolve: Function) => {
      const handleFirstConnectivityChangeIOS = (isConnected: boolean) => {
        NetInfo.isConnected.removeEventListener(
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
    connectionChecked = NetInfo.isConnected.fetch();
  }

  return connectionChecked.then((isConnected: boolean) => {
    if (isConnected) {
      return checkInternetAccess({ timeout, url });
    }
    return Promise.resolve(false);
  });
}
