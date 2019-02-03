import React from 'react';
import { View } from 'react-native';
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
  actionQueue: [],
};

const getProps = (overrides = {}) => ({ ...props, ...overrides });

describe('ReduxNetworkProvider', () => {
  afterEach(() => {
    dispatch.mockClear();
  });

  describe('render', () => {
    it('has the correct structure', () => {
      const { output } = rnShallow(
        <ReduxNetworkProvider>
          <View />
        </ReduxNetworkProvider>,
      );
      expect(output).toMatchSnapshot();
    });

    it('renders the children correctly', () => {
      const { getByTestId } = rnRender(
        <ReduxNetworkProvider>
          <View title="foo" testID="childrenView" />
        </ReduxNetworkProvider>,
      );
      const viewChild = getByTestId('childrenView');
      expect(viewChild.props.title).toBe('foo');
    });
  });

  describe('handleConnectivityChange', () => {
    it(`dispatches a CONNECTION_CHANGE action with the new connection`, () => {
      const wrapper = shallow(<ReduxNetworkProvider {...props} />);
      wrapper.instance().handleConnectivityChange(true);
      expect(props.dispatch).toHaveBeenCalledWith(connectionChange(true));
      expect(props.dispatch).toHaveBeenCalledTimes(1);
    });

    it(`does NOT dispatch a CONNECTION_CHANGE action if the connection
    did not change`, () => {
      const wrapper = shallow(
        <ReduxNetworkProvider {...getProps({ isConnected: true })} />,
      );
      wrapper.instance().handleConnectivityChange(true);
      expect(props.dispatch).not.toHaveBeenCalled();
    });
  });
});

describe('mapStateToProps', () => {
  it('maps isConnected and actionQueue state to props', () => {
    const networkState = {
      isConnected: false,
    };
    const state = {
      network: networkState,
    };
    expect(mapStateToProps(state)).toEqual(networkState);
  });
});
