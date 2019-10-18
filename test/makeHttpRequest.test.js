import makeHttpRequest, { headers } from '../src/utils/makeHttpRequest';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../src/utils/constants';

const mockOpen = jest.fn();
const mockSetRequestHeader = jest.fn();
const mockSend = jest.fn();
const mockSetTimeout = jest.fn();
const mockOnLoad = jest.fn();
const mockOnError = jest.fn();
const mockOnTimeout = jest.fn();

global.XMLHttpRequest = class MockXMLHttpRequest {
  constructor(callbackToFire = '') {
    this.callbackToFire = callbackToFire;
    switch (callbackToFire) {
      case 'onload/2xx':
        this.status = 200;
        break;
      case 'onload/3xx':
        this.status = 304;
        break;
      case 'onload/4xx':
        this.status = 403;
        break;
      case 'onload/5xx':
        this.status = 500;
        break;
      case 'onerror':
      case 'ontimeout':
        this.status = -1;
        break;
    }
  }

  set timeout(t) {
    mockSetTimeout(t);
    this.t = t;
  }

  set onload(fn) {
    mockOnLoad();
    if (this.callbackToFire.includes('onload')) {
      fn.call(this);
    }
  }

  set onerror(fn) {
    mockOnError();
    if (this.callbackToFire === 'onerror') {
      fn.call(this);
    }
  }

  set ontimeout(fn) {
    mockOnTimeout();
    if (this.callbackToFire === 'ontimeout') {
      fn.call(this);
    }
  }
};
global.XMLHttpRequest.prototype.open = mockOpen;
global.XMLHttpRequest.prototype.setRequestHeader = mockSetRequestHeader;
global.XMLHttpRequest.prototype.send = mockSend;

describe('makeHttpRequest', () => {
  afterEach(() => {
    mockOpen.mockClear();
    mockSend.mockClear();
    mockSetTimeout.mockClear();
    mockSetRequestHeader.mockClear();
    mockOnLoad.mockClear();
    mockOnError.mockClear();
    mockOnTimeout.mockClear();
  });
  const params = {
    method: 'HEAD',
    url: 'foo.com',
    timeout: 5000,
  };
  it('sets up the XMLHttpRequest configuration properly', async () => {
    const headerKeys = Object.keys(headers);
    makeHttpRequest(params);
    expect(mockOpen).toHaveBeenCalledWith(params.method, params.url);
    expect(mockSetTimeout).toHaveBeenCalledWith(params.timeout);
    expect(mockOnLoad).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnTimeout).toHaveBeenCalledTimes(1);
    expect(mockSetRequestHeader).toHaveBeenCalledTimes(3);
    headerKeys.forEach((key, index) => {
      expect(mockSetRequestHeader).toHaveBeenNthCalledWith(
        index + 1,
        key,
        headers[key],
      );
    });
    expect(mockSend).toHaveBeenCalledWith(null);
  });

  it('default parameters', () => {
    makeHttpRequest();
    expect(mockOpen).toHaveBeenCalledWith(
      DEFAULT_HTTP_METHOD,
      DEFAULT_PING_SERVER_URL,
    );
    expect(mockSetTimeout).toHaveBeenCalledWith(DEFAULT_TIMEOUT);
  });

  it('accepts custom headers', () => {
    makeHttpRequest({ ...params, customHeaders: { foo: 'bar' } });
    expect(mockSetRequestHeader).toHaveBeenCalledTimes(4);
  });

  describe('onload', () => {
    it('resolves the promise if status is 2xx or 3xx', async () => {
      let result = await makeHttpRequest({
        ...params,
        testMethod: 'onload/2xx',
      });
      expect(result).toEqual({ status: 200 });

      result = await makeHttpRequest({
        ...params,
        testMethod: 'onload/3xx',
      });

      expect(result).toEqual({ status: 304 });
    });

    it('rejects the promise if status is 4xx or 5xx', async () => {
      try {
        await makeHttpRequest({
          ...params,
          testMethod: 'onload/4xx',
        });
      } catch (e) {
        expect(e).toEqual({ status: 403 });
      }

      try {
        await makeHttpRequest({
          ...params,
          testMethod: 'onload/5xx',
        });
      } catch (e) {
        expect(e).toEqual({ status: 500 });
      }
    });
  });

  describe('onerror', () => {
    it('rejects the promise with the xhr status', async () => {
      try {
        await makeHttpRequest({
          ...params,
          testMethod: 'onerror',
        });
      } catch (e) {
        expect(e).toEqual({ status: -1 });
      }
    });
  });

  describe('ontimeout', () => {
    it('rejects the promise with the xhr status', async () => {
      try {
        await makeHttpRequest({
          ...params,
          testMethod: 'ontimeout',
        });
      } catch (e) {
        expect(e).toEqual({ status: -1 });
      }
    });
  });
});
