import makeHttpRequest from './makeHttpRequest';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from './constants';
import { HTTPMethod } from '../types';

type Arguments = {
  url: string,
  timeout: number,
  method?: HTTPMethod,
};

export default function checkInternetAccess({
  timeout = DEFAULT_TIMEOUT,
  url = DEFAULT_PING_SERVER_URL,
  method = DEFAULT_HTTP_METHOD,
}: Arguments): Promise<boolean> {
  return new Promise(async (resolve: (value: boolean) => void) => {
    try {
      await makeHttpRequest({
        method,
        url,
        timeout,
      });
      resolve(true);
    } catch (e) {
      resolve(false);
    }
  });
}
