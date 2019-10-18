import NetInfo from '@react-native-community/netinfo';
import checkInternetConnection from '../src/utils/checkInternetConnection';
import checkInternetAccess from '../src/utils/checkInternetAccess';
import {
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../src/utils/constants';
import { mocked } from 'ts-jest/utils';

jest.mock('../src/utils/checkInternetAccess');

mocked(checkInternetAccess).mockResolvedValue(true);

const fetch = NetInfo.isConnected.fetch as jest.Mock;

describe('checkInternetConnection', () => {
  afterEach(() => {
    mocked(checkInternetAccess).mockClear();
  });
  describe('shouldPing = true', () => {
    it(`calls checkInternetAccess and resolves the promise with its returned value`, async () => {
      const isConnected = await checkInternetConnection('foo.com', 3000, true);
      expect(checkInternetAccess).toHaveBeenCalledWith({
        timeout: 3000,
        url: 'foo.com',
      });
      expect(isConnected).toBe(true);
    });
  });

  describe('shouldPing = false', () => {
    it(`does NOT call checkInternetAccess and directly resolves the promise with a boolean`, async () => {
      fetch.mockImplementationOnce(() => Promise.resolve(false));
      const isConnected = await checkInternetConnection('foo.com', 3000, false);
      expect(checkInternetAccess).not.toHaveBeenCalled();
      expect(isConnected).toBe(false);
    });
  });

  it('default parameters', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve(true));
    const isConnected = await checkInternetConnection();
    expect(checkInternetAccess).toHaveBeenCalledWith({
      timeout: DEFAULT_TIMEOUT,
      url: DEFAULT_PING_SERVER_URL,
    });
    expect(isConnected).toBe(true);
  });
});
