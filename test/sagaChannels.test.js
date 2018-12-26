import { eventChannel } from 'redux-saga';
import { NetInfo } from 'react-native';
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
    expect(createNetInfoConnectionChangeChannel()).toBe('channel');
    expect(eventChannelMock).toHaveBeenCalledWith(netInfoEventChannelFn);
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
    expect(createIntervalChannel(interval)).toBe('channel');
    // TODO fix
    // expect(eventChannelMock).toHaveBeenCalledWith(intervalChannelFn(10000));
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
