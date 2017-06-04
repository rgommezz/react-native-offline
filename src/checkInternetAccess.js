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

  timeout(() => {
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

/*

export default function makeCancelable(promise: Promise<*>): CancelablePromise {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) => !hasCanceled_ && resolve(val));
    promise.catch((error) => !hasCanceled_ && reject(error));
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
}

*/
