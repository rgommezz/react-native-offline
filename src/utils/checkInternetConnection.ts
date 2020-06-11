import NetInfo from '@react-native-community/netinfo';
import checkInternetAccess from './checkInternetAccess';
import {
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HTTP_METHOD,
  DEFAULT_CUSTOM_HEADERS,
} from './constants';
import { HTTPMethod, HTTPHeaders } from '../types';

/**
 * Utility that allows to query for internet connectivity on demand
 * @param url
 * @param timeout
 * @param shouldPing
 * @param method
 * @returns {Promise<boolean>}
 */
export default async function checkInternetConnection(
  url: string = DEFAULT_PING_SERVER_URL,
  timeout: number = DEFAULT_TIMEOUT,
  shouldPing = true,
  method: HTTPMethod = DEFAULT_HTTP_METHOD,
  customHeaders: HTTPHeaders = DEFAULT_CUSTOM_HEADERS,
): Promise<boolean> {
  return NetInfo.fetch().then(async connectionState => {
    if (shouldPing) {
      const hasInternetAccess = await checkInternetAccess({
        timeout,
        url,
        method,
        customHeaders,
      });
      return hasInternetAccess;
    }
    return connectionState.isConnected;
  });
}
