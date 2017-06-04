/* @flow */

export default async (
  isConnected: boolean,
  address: string = 'http://google.com/text.txt', // We don't need a valid respond, but ANY respond
  timeout: number = 3000
) => {
  if (!isConnected) {
    return isConnected;
  }
  const start = new Date();

  return new Promise(resolve => {
    fetch(address)
      .then(() => {
        resolve(!(new Date() - start > timeout));
      })
      .catch(() => resolve(false));
  });
};
