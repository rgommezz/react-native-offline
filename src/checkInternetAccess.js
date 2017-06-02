/* @flow */

export default async (
  isConnected: boolean,
  address: string = 'http://google.com'
) => {
  if (!isConnected) {
    return isConnected;
  }

  return new Promise(resolve => {
    fetch(address).then(() => resolve(true)).catch(() => resolve(false));
  });
};
