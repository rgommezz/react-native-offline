import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
  CACHE_HEADER_VALUE,
  DEFAULT_CUSTOM_HEADERS,
} from './constants';
import { HTTPHeaders } from '../types';

type Options = {
  method?: 'HEAD' | 'OPTIONS';
  url: string;
  timeout?: number;
  testMethod?:
    | 'onload/2xx'
    | 'onload/3xx'
    | 'onload/4xx'
    | 'onload/5xx'
    | 'onerror'
    | 'ontimeout';
  customHeaders?: HTTPHeaders;
};

type ResolvedValue = {
  status: number;
};

export const headers = {
  'Cache-Control': CACHE_HEADER_VALUE,
  Pragma: 'no-cache' as 'no-cache',
  Expires: '0',
};

/**
 * Utility that promisifies XMLHttpRequest in order to have a nice API that supports cancellation.
 * @param method
 * @param url
 * @param timeout -> Timeout for rejecting the promise and aborting the API request
 * @param testMethod: for testing purposes
 * @param customHeaders: headers received from user configuration.
 * @returns {Promise}
 */

type PromiseHandler = (args: ResolvedValue) => void;
const DEFAULT_OPTIONS: Options = {
  method: DEFAULT_HTTP_METHOD,
  url: DEFAULT_PING_SERVER_URL,
  timeout: DEFAULT_TIMEOUT,
  customHeaders: DEFAULT_CUSTOM_HEADERS,
};
export default function makeHttpRequest(args?: Options) {
  const {
    method = DEFAULT_HTTP_METHOD,
    url = DEFAULT_PING_SERVER_URL,
    timeout = DEFAULT_TIMEOUT,
    customHeaders = DEFAULT_CUSTOM_HEADERS,
    testMethod,
  } = args || DEFAULT_OPTIONS;
  return new Promise((resolve: PromiseHandler, reject: PromiseHandler) => {
    // @ts-ignore
    const xhr = new XMLHttpRequest(testMethod);
    xhr.open(method, url);
    xhr.timeout = timeout;
    xhr.onload = function onLoad() {
      // 3xx is a valid response for us, since the server was reachable
      if (this.status >= 200 && this.status < 400) {
        resolve({
          status: this.status,
        });
      } else {
        reject({
          status: this.status,
        });
      }
    };
    xhr.onerror = function onError() {
      reject({
        status: this.status,
      });
    };
    xhr.ontimeout = function onTimeOut() {
      reject({
        status: this.status,
      });
    };

    const combinedHeaders = { ...headers, ...customHeaders };
    Object.keys(combinedHeaders).forEach(key => {
      const k = key as keyof typeof headers;
      xhr.setRequestHeader(k, combinedHeaders[k]);
    });
    xhr.send(null);
  });
}
