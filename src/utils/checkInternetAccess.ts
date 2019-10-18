import makeHttpRequest from './makeHttpRequest';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from './constants';
import { HTTPMethod, AddUndefined } from '../types';

type Arguments = {
  url: string;
  timeout: number;
  method?: HTTPMethod;
};

const DEFAULT_ARGUMENTS: Arguments = {
  timeout: DEFAULT_TIMEOUT,
  url: DEFAULT_PING_SERVER_URL,
  method: DEFAULT_HTTP_METHOD,
};
export default function checkInternetAccess(
  args?: AddUndefined<Arguments>,
): Promise<boolean> {
  const {
    timeout = DEFAULT_TIMEOUT,
    url = DEFAULT_PING_SERVER_URL,
    method = DEFAULT_HTTP_METHOD,
  } = args || DEFAULT_ARGUMENTS;

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
