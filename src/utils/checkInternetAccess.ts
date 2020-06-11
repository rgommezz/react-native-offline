import makeHttpRequest from './makeHttpRequest';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_CUSTOM_HEADERS,
} from './constants';
import { HTTPMethod, AddUndefined, HTTPHeaders } from '../types';

type Arguments = {
  url: string;
  timeout: number;
  method?: HTTPMethod;
  customHeaders: HTTPHeaders;
};

const DEFAULT_ARGUMENTS: Arguments = {
  timeout: DEFAULT_TIMEOUT,
  url: DEFAULT_PING_SERVER_URL,
  method: DEFAULT_HTTP_METHOD,
  customHeaders: DEFAULT_CUSTOM_HEADERS,
};
export default function checkInternetAccess(
  args?: AddUndefined<Arguments>,
): Promise<boolean> {
  const {
    timeout = DEFAULT_TIMEOUT,
    url = DEFAULT_PING_SERVER_URL,
    method = DEFAULT_HTTP_METHOD,
    customHeaders = DEFAULT_CUSTOM_HEADERS,
  } = args || DEFAULT_ARGUMENTS;

  return new Promise(async (resolve: (value: boolean) => void) => {
    try {
      await makeHttpRequest({
        method,
        url,
        timeout,
        customHeaders,
      });
      resolve(true);
    } catch (e) {
      resolve(false);
    }
  });
}
