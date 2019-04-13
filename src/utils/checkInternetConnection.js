/* @flow */

import NetInfo from "@react-native-community/netinfo";
import checkInternetAccess from './checkInternetAccess';
import { DEFAULT_PING_SERVER_URL, DEFAULT_TIMEOUT } from './constants';

/**
 * Utility that allows to query for internet connectivity on demand
 * @param url
 * @param timeout
 * @param shouldPing
 * @returns {Promise<boolean>}
 */
export default async function checkInternetConnection(
  url: string = DEFAULT_PING_SERVER_URL,
  timeout: number = DEFAULT_TIMEOUT,
  shouldPing: boolean = true,
): Promise<boolean> {
  return NetInfo.isConnected.fetch().then(async (isConnected: boolean) => {
    if (shouldPing) {
      const hasInternetAccess = await checkInternetAccess({ timeout, url });
      return hasInternetAccess;
    }
    return isConnected;
  });
}
