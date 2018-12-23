/* @flow */
import makeHttpRequest from './makeHttpRequest';
import type { HTTPMethod } from '../types';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from './constants';

export default function checkInternetAccess(
  timeout: number = DEFAULT_TIMEOUT,
  url: string = DEFAULT_PING_SERVER_URL,
  method: HTTPMethod = DEFAULT_HTTP_METHOD,
): Promise<boolean> {
  return new Promise(async (resolve: (value: boolean) => void) => {
    try {
      await makeHttpRequest({
        method,
        url,
        timeout,
      });
      resolve(true);
    } catch (e) {
      resolve(false);
    }
  });
}
