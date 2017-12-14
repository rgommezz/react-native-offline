/* @flow */
import makeHttpRequest from './makeHttpRequest';

export default function checkInternetAccess(
  timeout: number = 3000,
  url: string = 'https://google.com',
): Promise<boolean> {
  return new Promise((resolve: (value: boolean) => void) => {
    makeHttpRequest({
      method: 'HEAD',
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
