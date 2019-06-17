/* @flow */
import makeHttpRequest from './makeHttpRequest';
import type { HTTPMethod } from './types';

export default function checkInternetAccess(
  timeout: number = 3000,
  url: string = 'https://www.google.com/',
  method: HTTPMethod = 'HEAD',
): Promise<boolean> {
  return new Promise((resolve: (value: boolean) => void) => {
    makeHttpRequest({
      method,
      url,
      timeout,
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
}
