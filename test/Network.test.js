/* @flow */
import React from 'react';
import { View, Text, Platform, AppState } from 'react-native';
import { shallow } from 'enzyme';
import { render } from 'react-native-testing-library';
import NetworkProvider from '../src/NetworkProvider';
import NetworkConsumer from '../src/NetworkConsumer';
import { setup, clear } from '../src/checkConnectivityInterval';
import checkInternetAccess from '../src/checkInternetAccess';

type MethodsMap = {
  [string]: Function,
};

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockFetch = jest.fn(() => false);
const mockConnectionChangeHandler = jest.fn();
const mockGetConnectionChangeHandler = jest.fn(
  () => mockConnectionChangeHandler,
);
const mockIntervalHandler = jest.fn();
const mockHandleNetInfoChange = jest.fn();
const mockHandleConnectivityChange = jest.fn();
const mockCheckInternet = jest.fn();

jest.mock('NetInfo', () => ({
  isConnected: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    fetch: mockFetch,
  },
}));

jest.mock('../src/checkConnectivityInterval');
jest.mock('../src/checkInternetAccess', () =>
  jest.fn().mockResolvedValue(true),
);

function Consumer() {
  return (
    <NetworkConsumer>
      {({ isConnected }) => (
        <Text testID="connectionText">{`Connected: ${isConnected}`}</Text>
      )}
    </NetworkConsumer>
  );
}

/**
 * Helper function that creates a class that extends NetworkProvider
 * and mocks the specific methods on the prototype,
 * in order to not affect the rest of the tests
 * @param methodsMap
 * @returns {ClassWithMocks}
 */
function mockPrototypeMethods(methodsMap: MethodsMap = {}) {
  class ClassWithMocks extends NetworkProvider {}
  Object.entries(methodsMap).forEach(([method, mockFn]: *) => {
    ClassWithMocks.prototype[method] = mockFn;
  });
  return ClassWithMocks;
}

const getElement = ({
  props = {},
  children = null,
  Component = NetworkProvider,
}) => <Component {...props}>{children}</Component>;

describe('NetworkProvider', () => {
  afterEach(() => {
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();
    mockFetch.mockClear();
    mockConnectionChangeHandler.mockClear();
    mockGetConnectionChangeHandler.mockClear();
    mockIntervalHandler.mockClear();
    mockHandleNetInfoChange.mockClear();
    mockHandleConnectivityChange.mockClear();
    mockCheckInternet.mockClear();
  });
  it('renders the children as it is', () => {
    const wrapper = shallow(getElement({ children: <View /> }));
    expect(wrapper.props().children.type.displayName).toBe('View');
  });

  describe('componentDidMount', () => {
    describe('iOS, pingInterval = 0', () => {
      it(`sets up a NetInfo.isConnected listener for connectionChange 
      AND does NOT call setupConnectivityCheckInterval`, () => {
        Platform.OS = 'ios';
        const MockedNetworkProvider = mockPrototypeMethods({
          getConnectionChangeHandler: mockGetConnectionChangeHandler,
        });
        shallow(
          getElement({ children: <View />, Component: MockedNetworkProvider }),
        );
        expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        expect(mockAddEventListener).toHaveBeenCalledWith(
          'connectionChange',
          mockConnectionChangeHandler,
        );
        expect(setup).not.toHaveBeenCalled();
      });
    });

    describe('Android, pingInterval = 0', () => {
      it(`sets up a NetInfo.isConnected listener for connectionChange
      AND fetches initial connection
      AND calls the handler
      AND does NOT call setupConnectivityCheckInterval`, done => {
        Platform.OS = 'android';
        const MockedNetworkProvider = mockPrototypeMethods({
          getConnectionChangeHandler: mockGetConnectionChangeHandler,
        });
        shallow(
          getElement({
            children: <View />,
            Component: MockedNetworkProvider,
          }),
        );
        expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        expect(mockAddEventListener).toHaveBeenCalledWith(
          'connectionChange',
          mockConnectionChangeHandler,
        );
        expect(mockFetch).toHaveBeenCalledTimes(1);
        process.nextTick(() => {
          expect(mockConnectionChangeHandler).toHaveBeenCalledWith(false);
          expect(setup).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it(`calls setupConnectivityCheckInterval with the right arguments
     WHEN pingInterval is higher than 0`, () => {
      Platform.OS = 'ios';
      const MockedNetworkProvider = mockPrototypeMethods({
        intervalHandler: mockIntervalHandler,
      });
      shallow(
        getElement({
          children: <View />,
          Component: MockedNetworkProvider,
          props: {
            pingInterval: 1000,
          },
        }),
      );
      expect(setup).toHaveBeenCalled();
    });
  });

  describe('componentWillUnmount', () => {
    it(`removes the NetInfo listener with the right parameters
      AND call connectivityInterval.clear`, () => {
      const MockedNetworkProvider = mockPrototypeMethods({
        getConnectionChangeHandler: mockGetConnectionChangeHandler,
      });
      const wrapper = shallow(
        getElement({
          children: <View />,
          Component: MockedNetworkProvider,
        }),
      );
      wrapper.unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'connectionChange',
        mockConnectionChangeHandler,
      );
      expect(clear).toHaveBeenCalled();
    });
  });

  describe('getConnectionChangeHandler', () => {
    it('returns this.handleNetInfoChange when props.shouldPing = true', () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
          props: {
            shouldPing: true,
          },
        }),
      );
      wrapper.instance().handleNetInfoChange = mockHandleNetInfoChange;
      expect(wrapper.instance().getConnectionChangeHandler()).toBe(
        mockHandleNetInfoChange,
      );
    });

    it('returns this.handleConnectivityChange when props.shouldPing = false', () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
          props: {
            shouldPing: false,
          },
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      expect(wrapper.instance().getConnectionChangeHandler()).toBe(
        mockHandleConnectivityChange,
      );
    });
  });

  describe('handleNetInfoChange', () => {
    it('calls handleConnectivityChange if isConnected is false', () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.instance().handleNetInfoChange(false);
      expect(mockHandleConnectivityChange).toHaveBeenCalledWith(false);
      expect(mockCheckInternet).not.toHaveBeenCalled();
    });

    it('calls checkInternet if isConnected is true', () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.instance().handleNetInfoChange(true);
      expect(mockHandleConnectivityChange).not.toHaveBeenCalled();
      expect(mockCheckInternet).toHaveBeenCalled();
    });
  });

  describe('checkInternet', () => {
    it('returns early if pingIfBackground = false AND app is not in the foreground', async () => {
      AppState.currentState = 'background';
      const wrapper = shallow(
        getElement({
          children: <View />,
          props: {
            pingInBackground: false,
          },
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      await wrapper.instance().checkInternet();
      expect(checkInternetAccess).not.toHaveBeenCalled();
      expect(mockHandleConnectivityChange).not.toHaveBeenCalled();
    });

    it(`calls checkInternetAccess AND handleConnectivityChange 
    with the right arguments if app is in foreground`, async () => {
      const props = {
        timeout: 2000,
        pingServerUrl: 'dummy.com',
        httpMethod: 'OPTIONS',
      };
      AppState.currentState = 'active';
      const wrapper = shallow(
        getElement({
          children: <View />,
          props,
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      await wrapper.instance().checkInternet();
      expect(checkInternetAccess).toHaveBeenCalledWith(
        props.timeout,
        props.pingServerUrl,
        props.httpMethod,
      );
      expect(mockHandleConnectivityChange).toHaveBeenCalledWith(true);
    });
  });

  describe('intervalHandler', () => {
    it('returns early if there is connection AND pingOnlyIfOffline = true', () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
          props: {
            pingOnlyIfOffline: true,
          },
        }),
      );
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.setState({ isConnected: true });
      wrapper.instance().intervalHandler();
      expect(mockCheckInternet).not.toHaveBeenCalled();
    });

    it(`calls checkInternet if it's not connected OR pingOnlyIfOffline = false`, () => {
      const wrapper = shallow(
        getElement({
          children: <View />,
          props: {
            pingOnlyIfOffline: false,
          },
        }),
      );
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.setState({ isConnected: false });
      wrapper.instance().intervalHandler();
      expect(mockCheckInternet).toHaveBeenCalledTimes(1);

      wrapper.setState({ isConnected: true });
      wrapper.instance().intervalHandler();
      expect(mockCheckInternet).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleConnectivityChange', () => {
    it('calls setState with the new connection value', () => {
      const mockSetState = jest.fn();
      const MockedNetworkProvider = mockPrototypeMethods({
        setState: mockSetState,
      });
      const wrapper = shallow(
        getElement({
          children: <View />,
          Component: MockedNetworkProvider,
        }),
      );

      wrapper.instance().handleConnectivityChange(true);
      expect(mockSetState).toHaveBeenCalledWith({ isConnected: true });

      wrapper.instance().handleConnectivityChange(false);
      expect(mockSetState).toHaveBeenCalledWith({ isConnected: false });
    });
  });

  describe('props validation', () => {
    it('throws if prop timeout is not a number', () => {
      expect(() =>
        render(getElement({ children: <View />, props: { timeout: '4000' } })),
      ).toThrow('you should pass a number as timeout parameter');
    });

    it('throws if prop pingServerUrl is not a string', () => {
      expect(() =>
        render(
          getElement({ children: <View />, props: { pingServerUrl: 90 } }),
        ),
      ).toThrow('you should pass a string as pingServerUrl parameter');
    });

    it('throws if prop shouldPing is not a boolean', () => {
      expect(() =>
        render(
          getElement({ children: <View />, props: { shouldPing: () => null } }),
        ),
      ).toThrow('you should pass a boolean as shouldPing parameter');
    });

    it('throws if prop pingInterval is not a number', () => {
      expect(() =>
        render(
          getElement({ children: <View />, props: { pingInterval: false } }),
        ),
      ).toThrow('you should pass a number as pingInterval parameter');
    });

    it('throws if prop pingOnlyIfOffline is not a boolean', () => {
      expect(() =>
        render(
          getElement({ children: <View />, props: { pingOnlyIfOffline: 10 } }),
        ),
      ).toThrow('you should pass a boolean as pingOnlyIfOffline parameter');
    });

    it('throws if prop pingInBackground is not a boolean', () => {
      expect(() =>
        render(
          getElement({
            children: <View />,
            props: { pingInBackground: '4000' },
          }),
        ),
      ).toThrow('you should pass a string as pingServerUrl parameter');
    });

    it('throws if prop httpMethod is not either HEAD or OPTIONS', () => {
      expect(() =>
        render(
          getElement({ children: <View />, props: { httpMethod: 'POST' } }),
        ),
      ).toThrow('httpMethod parameter should be either HEAD or OPTIONS');
    });
  });
});

describe('NetworkConsumer', () => {
  it('receives isConnected prop from Provider using context', () => {
    const { getByTestId } = render(getElement({ children: <Consumer /> }));
    const textChild = getByTestId('connectionText');
    expect(textChild.props.children).toBe('Connected: true');
  });

  it(`throws if it's not rendered within the Provider`, () => {
    expect(() => render(<Consumer />)).toThrow(
      'NetworkConsumer components should be rendered within NetworkProvider. ' +
        'Make sure you are rendering a NetworkProvider at the top of your component hierarchy',
    );
  });
});
