/* @flow */

type Options = {
  method?: string,
  url: string,
  params?:
    | string
    | {
        [name: string]: string,
      },
  headers?: Object,
  timeout?: number,
};

/**
 * Utility that promisifies XMLHttpRequest in order to have a nice API that supports cancellation.
 * @param method
 * @param url
 * @param params -> This is the body payload for POST requests
 * @param headers
 * @param timeout -> Timeout for rejecting the promise and aborting the API request
 * @returns {Promise}
 */
export default function makeHttpRequest({
  method = 'get',
  url,
  params,
  headers = {},
  timeout = 10000,
}: Options = {}) {
  return new Promise((resolve: any, reject: any) => {
    const xhr = new XMLHttpRequest();

    const tOut = setTimeout(() => {
      xhr.abort();
      reject('timeout');
    }, timeout);

    xhr.open(method, url);
    xhr.onload = function onLoad() {
      // 3xx is a valid response for us, since the server was reachable
      if (this.status >= 200 && this.status < 400) {
        clearTimeout(tOut);
        resolve(xhr.response);
      } else {
        clearTimeout(tOut);
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function onError() {
      clearTimeout(tOut);
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    if (headers) {
      Object.keys(headers).forEach((key: string) => {
        xhr.setRequestHeader(key, headers[key]);
      });
    }
    let requestParams = params;
    // We'll need to stringify if we've been given an object
    // If we have a string, this is skipped.
    if (requestParams && typeof requestParams === 'object') {
      requestParams = Object.keys(requestParams)
        .map(
          (key: string) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              // $FlowFixMe
              requestParams[key],
            )}`,
        )
        .join('&');
    }
    xhr.send(params);
  });
}
