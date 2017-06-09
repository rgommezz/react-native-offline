/* @flow */

export default async (
  isConnected: boolean,
  address: string = 'https://google.com',
  timeout: number = 3000
): Promise<boolean> => {
  if (!isConnected) {
    return false;
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
};
