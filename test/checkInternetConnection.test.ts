import NetInfo from '@react-native-community/netinfo';
import { mocked } from 'ts-jest/utils';
import checkInternetConnection from '../src/utils/checkInternetConnection';
import checkInternetAccess from '../src/utils/checkInternetAccess';
import {
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_HTTP_METHOD,
  DEFAULT_CUSTOM_HEADERS,
} from '../src/utils/constants';

jest.mock('../src/utils/checkInternetAccess');

mocked(checkInternetAccess).mockResolvedValue(true);

const fetch = NetInfo.fetch as jest.Mock;

describe('checkInternetConnection', () => {
  afterEach(() => {
    mocked(checkInternetAccess).mockClear();
  });
  describe('shouldPing = true', () => {
    it(`calls checkInternetAccess and resolves the promise with its returned value`, async () => {
      const isConnected = await checkInternetConnection('foo.com', 3000, true);
      expect(checkInternetAccess).toHaveBeenCalledWith({
        method: DEFAULT_HTTP_METHOD,
        timeout: 3000,
        url: 'foo.com',
        customHeaders: DEFAULT_CUSTOM_HEADERS,
      });
      expect(isConnected).toBe(true);
    });
  });

  describe('shouldPing = false', () => {
    it(`does NOT call checkInternetAccess and directly resolves the promise with a boolean`, async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({ isConnected: false }),
      );
      const isConnected = await checkInternetConnection('foo.com', 3000, false);
      expect(checkInternetAccess).not.toHaveBeenCalled();
      expect(isConnected).toBe(false);
    });
  });

  it('default parameters', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ isConnected: true }));
    const isConnected = await checkInternetConnection();
    expect(checkInternetAccess).toHaveBeenCalledWith({
      method: DEFAULT_HTTP_METHOD,
      timeout: DEFAULT_TIMEOUT,
      url: DEFAULT_PING_SERVER_URL,
      customHeaders: DEFAULT_CUSTOM_HEADERS,
    });
    expect(isConnected).toBe(true);
  });
});
