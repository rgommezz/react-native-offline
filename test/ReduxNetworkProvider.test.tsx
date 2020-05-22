import React from 'react';
import { View, Text } from 'react-native';
import {
  shallow as rnShallow,
  render as rnRender,
} from 'react-native-testing-library';
import { shallow } from 'enzyme';
import {
  ReduxNetworkProvider,
  mapStateToProps,
} from '../src/components/ReduxNetworkProvider';
import { connectionChange } from '../src/redux/actionCreators';

const dispatch = jest.fn();
const props = {
  dispatch,
  isConnected: false,
};

const getProps = (overrides = {}) => ({ ...props, ...overrides });

describe('ReduxNetworkProvider', () => {
  afterEach(() => {
    dispatch.mockClear();
  });

  describe('render', () => {
    it('has the correct structure', () => {
      const { output } = rnShallow(
        <ReduxNetworkProvider {...props}>
          <View />
        </ReduxNetworkProvider>,
      );
      expect(output).toMatchSnapshot();
    });

    it('renders the children correctly', () => {
      const { getByText } = rnRender(
        <ReduxNetworkProvider {...props}>
          <Text>Baz</Text>
        </ReduxNetworkProvider>,
      );

      const viewChild = getByText('Baz');
      expect(viewChild).toBeDefined();
    });
  });

  describe('handleConnectivityChange', () => {
    it(`dispatches a CONNECTION_CHANGE action with the new connection`, () => {
      const wrapper = shallow<ReduxNetworkProvider>(
        <ReduxNetworkProvider {...props}>
          <View />
        </ReduxNetworkProvider>,
      );
      wrapper.instance().handleConnectivityChange(true);
      expect(props.dispatch).toHaveBeenCalledWith(connectionChange(true));
      expect(props.dispatch).toHaveBeenCalledTimes(1);
    });

    it(`does NOT dispatch a CONNECTION_CHANGE action if the connection
    did not change`, () => {
      const wrapper = shallow<ReduxNetworkProvider>(
        <ReduxNetworkProvider {...getProps({ isConnected: true })}>
          <View />
        </ReduxNetworkProvider>,
      );
      wrapper.instance().handleConnectivityChange(true);
      expect(props.dispatch).not.toHaveBeenCalled();
    });
  });
});

describe('mapStateToProps', () => {
  it('maps isConnected and actionQueue state to props', () => {
    const expected = { isConnected: false };
    const state = {
      network: {
        actionQueue: [],
        isQueuePaused: false,
        ...expected,
      },
    };

    expect(mapStateToProps(state)).toEqual(expected);
  });
});
