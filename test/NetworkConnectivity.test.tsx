import * as React from 'react';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { AppState, Platform, View } from 'react-native';
import { shallow } from 'enzyme';
import { render } from 'react-native-testing-library';
import NetworkConnectivity, {
  RequiredProps,
} from '../src/components/NetworkConnectivity';
import { clear, setup } from '../src/utils/checkConnectivityInterval';
import checkInternetAccess from '../src/utils/checkInternetAccess';
import entries from '../src/utils/objectEntries';
import { DEFAULT_CUSTOM_HEADERS } from '../src/utils/constants';

type OptionalProps = Omit<RequiredProps, 'children'>;
type GetElementParams<P = any> = {
  props?: Pick<RequiredProps, 'children'> & Partial<OptionalProps>;
  Component?: React.ComponentType<P>;
};

interface MethodsMap {
  getConnectionChangeHandler?: any;
  intervalHandler?: any;
  setState?: any;
}
const mockConnectionChangeHandler = jest.fn();
const mockGetConnectionChangeHandler = jest.fn(
  () => mockConnectionChangeHandler,
);
const mockIntervalHandler = jest.fn();
const mockHandleNetInfoChange = jest.fn();
const mockHandleConnectivityChange = jest.fn();
const mockCheckInternet = jest.fn();

const addEventListener = NetInfo.addEventListener as jest.Mock;
const unsubscribe = jest.fn();
const fetch = NetInfo.fetch as jest.Mock;
jest.mock('../src/utils/checkConnectivityInterval');
jest.mock('../src/utils/checkInternetAccess', () =>
  jest.fn().mockResolvedValue(true),
);

/**
 * Helper function that creates a class that extends NetworkConnectivity
 * and mocks the specific methods on the prototype,
 * in order to not affect the rest of the tests
 * @param methodsMap
 * @returns {ClassWithMocks}
 */

function mockPrototypeMethods(methodsMap: MethodsMap = {} as MethodsMap) {
  class ClassWithMocks extends NetworkConnectivity {}
  entries(methodsMap).forEach(
    ([method, mockFn]) => (ClassWithMocks.prototype[method] = mockFn),
  );
  return ClassWithMocks;
}

const ChildrenComponent = () => <View />;

const initialProps = {
  children: ChildrenComponent,
};

const getElement = ({
  props = initialProps,
  Component = NetworkConnectivity,
}: GetElementParams = {}) => {
  const { children, ...rest } = props;
  return <Component {...rest}>{children}</Component>;
};

describe('NetworkConnectivity', () => {
  afterEach(() => {
    addEventListener.mockClear();
    fetch.mockClear();
    mockConnectionChangeHandler.mockClear();
    mockGetConnectionChangeHandler.mockClear();
    mockIntervalHandler.mockClear();
    mockHandleNetInfoChange.mockClear();
    mockHandleConnectivityChange.mockClear();
    mockCheckInternet.mockClear();
  });

  it('defaultProps', () => {
    expect(NetworkConnectivity.defaultProps).toMatchSnapshot();
  });

  it('passes the connection state into the FACC', () => {
    const children = jest.fn();
    shallow(getElement({ props: { children } }));
    expect(children).toHaveBeenCalledWith({ isConnected: true });
  });

  describe('componentDidMount', () => {
    describe('iOS, pingInterval = 0', () => {
      it(`sets up a NetInfo.isConnected listener for connectionChange 
      AND does NOT call setupConnectivityCheckInterval`, () => {
        Platform.OS = 'ios';
        const MockedNetworkConnectivity = mockPrototypeMethods({
          getConnectionChangeHandler: mockGetConnectionChangeHandler,
        });
        shallow(
          getElement({
            Component: MockedNetworkConnectivity,
          }),
        );
        expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
        expect(NetInfo.addEventListener).toHaveBeenCalledWith(
          mockConnectionChangeHandler,
        );
        expect(setup).not.toHaveBeenCalled();
      });
    });

    describe('Android, pingInterval = 0', () => {
      it(`sets up a NetInfo.isConnected listener for connectionChange
      AND fetches initial connection
      AND calls the handler
      AND does NOT call setupConnectivityCheckInterval`, (done: Function) => {
        fetch.mockImplementationOnce(() => Promise.resolve(false));
        Platform.OS = 'android';
        const MockedNetworkConnectivity = mockPrototypeMethods({
          getConnectionChangeHandler: mockGetConnectionChangeHandler,
        });
        shallow(
          getElement({
            Component: MockedNetworkConnectivity,
          }),
        );
        expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
        expect(NetInfo.addEventListener).toHaveBeenCalledWith(
          mockConnectionChangeHandler,
        );
        expect(NetInfo.fetch).toHaveBeenCalledTimes(1);
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
      const MockedNetworkConnectivity = mockPrototypeMethods({
        intervalHandler: mockIntervalHandler,
      });
      shallow(
        getElement({
          Component: MockedNetworkConnectivity,
          props: {
            children: ChildrenComponent,
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
      (NetInfo.addEventListener as jest.Mock).mockReturnValueOnce(unsubscribe);
      const MockedNetworkConnectivity = mockPrototypeMethods({
        getConnectionChangeHandler: mockGetConnectionChangeHandler,
      });
      const wrapper = shallow(
        getElement({
          Component: MockedNetworkConnectivity,
        }),
      );
      wrapper.unmount();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
      expect(clear).toHaveBeenCalled();
    });
  });

  describe('getConnectionChangeHandler', () => {
    it('returns this.handleNetInfoChange when props.shouldPing = true', () => {
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props: {
            children: ChildrenComponent,
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
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props: {
            children: ChildrenComponent,
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
      const wrapper = shallow<NetworkConnectivity>(getElement());
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.instance().handleNetInfoChange({
        type: 'none' as NetInfoStateType.none,
        isConnected: false,
        isInternetReachable: false,
        details: null,
      });
      expect(mockHandleConnectivityChange).toHaveBeenCalledWith({
        type: 'none' as NetInfoStateType.none,
        isConnected: false,
        isInternetReachable: false,
        details: null,
      });
      expect(mockCheckInternet).not.toHaveBeenCalled();
    });

    it('calls checkInternet if isConnected is true', () => {
      const wrapper = shallow<NetworkConnectivity>(getElement());
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      wrapper.instance().checkInternet = mockCheckInternet;
      wrapper.instance().handleNetInfoChange({
        type: 'other' as NetInfoStateType.other,
        isConnected: true,
        isInternetReachable: true,
        details: {
          cellularGeneration: null,
          isConnectionExpensive: false,
        },
      });
      expect(mockHandleConnectivityChange).not.toHaveBeenCalled();
      expect(mockCheckInternet).toHaveBeenCalled();
    });
  });

  describe('checkInternet', () => {
    it('returns early if pingIfBackground = false AND app is not in the foreground', async () => {
      AppState.currentState = 'background';
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props: {
            children: ChildrenComponent,
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
        pingTimeout: 2000,
        pingServerUrl: 'dummy.com',
        httpMethod: 'OPTIONS' as 'OPTIONS',
        children: ChildrenComponent,
        customHeaders: DEFAULT_CUSTOM_HEADERS,
      };
      AppState.currentState = 'active';
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props,
        }),
      );
      wrapper.instance().handleConnectivityChange = mockHandleConnectivityChange;
      await wrapper.instance().checkInternet();
      expect(checkInternetAccess).toHaveBeenCalledWith({
        url: props.pingServerUrl,
        timeout: props.pingTimeout,
        method: props.httpMethod,
        customHeaders: props.customHeaders,
      });
      expect(mockHandleConnectivityChange).toHaveBeenCalledWith({
        isConnected: true,
      });
    });
  });

  describe('intervalHandler', () => {
    it('returns early if there is connection AND pingOnlyIfOffline = true', () => {
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props: {
            children: ChildrenComponent,
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
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          props: {
            children: ChildrenComponent,
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
      const MockedNetworkConnectivity = mockPrototypeMethods({
        setState: mockSetState,
      });
      const wrapper = shallow<NetworkConnectivity>(
        getElement({
          Component: MockedNetworkConnectivity,
        }),
      );

      wrapper.instance().handleConnectivityChange({
        type: 'other' as NetInfoStateType.other,
        isConnected: true,
        isInternetReachable: true,
        details: {
          cellularGeneration: null,
          isConnectionExpensive: false,
        },
      });
      expect(mockSetState).toHaveBeenCalledWith({ isConnected: true });

      wrapper.instance().handleConnectivityChange({
        type: 'none' as NetInfoStateType.none,
        isConnected: false,
        isInternetReachable: false,
        details: null,
      });
      expect(mockSetState).toHaveBeenCalledWith({ isConnected: false });
    });
  });

  describe('pingUrlChange', () => {
    it('calls checkInternet if pingServerUrl changes', () => {
      const wrapper = shallow<NetworkConnectivity>(getElement());
      wrapper.instance().checkInternet = mockCheckInternet;
      expect(mockCheckInternet).not.toHaveBeenCalled();
      wrapper.setProps({ pingServerUrl: 'https://newServerToPing.com' });
      expect(mockCheckInternet).toHaveBeenCalled();
    });
  });

  describe('props validation', () => {
    it('throws if prop pingTimeout is not a number', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { pingTimeout: '4000', children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a number as pingTimeout parameter');
    });

    it('throws if prop pingServerUrl is not a string', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { pingServerUrl: 90, children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a string as pingServerUrl parameter');
    });

    it('throws if prop shouldPing is not a boolean', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { shouldPing: () => null, children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a boolean as shouldPing parameter');
    });

    it('throws if prop pingInterval is not a number', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { pingInterval: false, children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a number as pingInterval parameter');
    });

    it('throws if prop pingOnlyIfOffline is not a boolean', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { pingOnlyIfOffline: 10, children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a boolean as pingOnlyIfOffline parameter');
    });

    it('throws if prop pingInBackground is not a boolean', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { pingInBackground: '4000', children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a string as pingServerUrl parameter');
    });

    it('throws if prop httpMethod is not either HEAD or OPTIONS', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { httpMethod: 'POST', children: ChildrenComponent },
          }),
        ),
      ).toThrow('httpMethod parameter should be either HEAD or OPTIONS');
    });

    it('throws if prop onConnectivityChange is not a function', () => {
      expect(() =>
        render(
          // @ts-ignore
          getElement({
            props: { onConnectivityChange: 'foo', children: ChildrenComponent },
          }),
        ),
      ).toThrow('you should pass a function as onConnectivityChange parameter');
    });
  });
});
