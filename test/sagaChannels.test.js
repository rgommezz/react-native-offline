import { eventChannel } from 'redux-saga';
import NetInfo from '@react-native-community/netinfo';
import {
  createNetInfoConnectionChangeChannel,
  netInfoEventChannelFn,
  createIntervalChannel,
  intervalChannelFn,
} from '../src/redux/sagas';

jest.mock('redux-saga');
jest.mock('NetInfo');

describe('createNetInfoConnectionChangeChannel', () => {
  it('returns a redux-saga channel', () => {
    const eventChannelMock = jest.fn().mockReturnValue('channel');
    eventChannel.mockImplementation(eventChannelMock);
    const mockNetInfoChannelFn = jest.fn().mockReturnValue('handlerFn');
    expect(createNetInfoConnectionChangeChannel(mockNetInfoChannelFn)).toBe(
      'channel',
    );
    expect(eventChannelMock).toHaveBeenCalledWith(mockNetInfoChannelFn);
  });

  it('netInfoEventChannelFn adheres to eventChannel cb interface', () => {
    const emitMock = jest.fn();
    const unsubscribe = netInfoEventChannelFn(emitMock);
    expect(NetInfo.isConnected.addEventListener).toHaveBeenCalledWith(
      'connectionChange',
      emitMock,
    );
    unsubscribe();
    expect(NetInfo.isConnected.removeEventListener).toHaveBeenCalledWith(
      'connectionChange',
      emitMock,
    );
  });
});

describe('createIntervalChannel', () => {
  const interval = 50;
  it('returns a redux-saga channel', () => {
    const eventChannelMock = jest.fn().mockReturnValue('channel');
    eventChannel.mockImplementation(eventChannelMock);
    const mockIntervalChannelFn = jest.fn().mockReturnValue('handlerFn');
    expect(createIntervalChannel(interval, mockIntervalChannelFn)).toBe(
      'channel',
    );
    expect(mockIntervalChannelFn).toHaveBeenCalledWith(interval);
    expect(eventChannel).toHaveBeenCalledWith('handlerFn');
  });

  it('intervalChannelFn adheres to eventChannel cb interface', done => {
    global.clearInterval = jest.fn();
    const emitMock = jest.fn();
    const unsubscribe = intervalChannelFn(interval)(emitMock);
    setTimeout(() => {
      expect(emitMock).toHaveBeenCalledWith(true);
      done();
    }, interval + 20);
    unsubscribe();
    expect(global.clearInterval).toHaveBeenCalled();
  });
});
