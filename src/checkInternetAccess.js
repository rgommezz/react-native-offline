/* @flow */

export default function checkInternetAccess(
  isConnected: boolean,
  timeout: number = 3000,
  address: string = 'https://google.com'
): Promise<boolean> {
  if (!isConnected) {
    return Promise.resolve(false);
  }

  return new Promise(resolve => {
    const tm = setTimeout(() => {
      resolve(false);
    }, timeout);

    fetch(address, { method: 'HEAD' })
      .then(() => {
        clearTimeout(tm);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(tm);
        resolve(false);
      });
  });
}
