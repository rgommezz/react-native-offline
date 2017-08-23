/* @flow */

export default function checkInternetAccess(
  timeout: number = 3000,
  address: string = 'https://google.com',
): Promise<boolean> {
  return new Promise((resolve: (value: boolean) => void) => {
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
