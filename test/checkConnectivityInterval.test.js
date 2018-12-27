import {
  setup,
  clear,
  getInterval,
} from '../src/utils/checkConnectivityInterval';

describe('checkConnectivityInterval', () => {
  const mockConnectivityCheck = jest.fn();
  global.setInterval = jest.fn(() => '1');
  global.clearInterval = jest.fn();
  afterEach(() => {
    global.setInterval.mockClear();
    global.clearInterval.mockClear();
    mockConnectivityCheck.mockClear();
  });
  describe('setup', () => {
    it('sets an interval if checkConnectionInterval is higher than 0', () => {
      setup(mockConnectivityCheck, 3000);
      expect(global.setInterval).toHaveBeenCalledWith(
        mockConnectivityCheck,
        3000,
      );
      expect(getInterval()).toBe('1');
    });

    it('does nothing if checkConnectionInterval is NOT higher than 0', () => {
      setup(mockConnectivityCheck, 0);
      expect(global.setInterval).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('clears the interval if there was one active', () => {
      setup(mockConnectivityCheck, 3000);
      clear();
      expect(global.clearInterval).toHaveBeenCalledWith('1');
      expect(getInterval()).toBeNull();
    });

    it('does nothing if NO previous interval was set', () => {
      clear();
      expect(global.clearInterval).not.toHaveBeenCalled();
    });
  });
});
