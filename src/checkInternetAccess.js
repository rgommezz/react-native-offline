/* @flow */

export default async (
  isConnected: boolean,
  address: string = 'http://google.com/text.txt', // We don't need a valid respond, but ANY respond
  timeout: number = 3000
) => {
  if (!isConnected) {
    return isConnected;
  }
  let timedOut = false;

  setTimeout(() => {
    timedOut = true;
  }, timeout);

  return new Promise(resolve => {
    fetch(address)
      .then(() => {
        resolve(!timedOut); // We have internet connection if not timmed out
      })
      .catch(() => resolve(false));
  });
};
