/* @flow */

export default async (
  isConnected: boolean,
  address: string = 'http://google.com/text.txt', // We don't need a valid respond, but ANY respond
  timeout: number = 3000
) => {
  if (!isConnected) {
    return isConnected;
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(false);
    }, timeout);

    fetch(address)
      .then(() => {
        resolve(true);
      })
      .catch(() => resolve(false));
  });
};
