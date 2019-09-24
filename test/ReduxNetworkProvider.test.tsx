import React from "react";
import { View } from "react-native";
import {
  shallow as rnShallow,
  render as rnRender
} from "react-native-testing-library";
import { shallow } from "enzyme";
import ConnectedReduxNetworkProvider, {
  ReduxNetworkProvider,
  mapStateToProps
} from "../src/components/ReduxNetworkProvider";
import { connectionChange } from "../src/redux/actionCreators";

const mockedConnectionChange = jest.fn(connectionChange);
const props = {
  connectionChange: mockedConnectionChange,
  isConnected: false,
  actionQueue: []
};

const getProps = (overrides = {}) => ({ ...props, ...overrides });

describe("ReduxNetworkProvider", () => {
  afterEach(() => {
    mockedConnectionChange.mockClear();
  });

  describe("render", () => {
    it("has the correct structure", () => {
      const { output } = rnShallow(
        <ConnectedReduxNetworkProvider>
          <View />
        </ConnectedReduxNetworkProvider>
      );
      expect(output).toMatchSnapshot();
    });

    it("renders the children correctly", () => {
      const { getByTestId } = rnRender(
        <ConnectedReduxNetworkProvider>
          <View key="foo" testID="childrenView" />
        </ConnectedReduxNetworkProvider>
      );
      const viewChild = getByTestId("childrenView");
      expect(viewChild.props.title).toBe("foo");
    });
  });

  describe("handleConnectivityChange", () => {
    it(`dispatches a CONNECTION_CHANGE action with the new connection`, () => {
      const wrapper = shallow<ReduxNetworkProvider>(
        <ReduxNetworkProvider {...props} />
      );
      wrapper.instance().handleConnectivityChange(true);
      expect(props.connectionChange).toHaveBeenCalledWith(true);
      expect(props.connectionChange).toHaveBeenCalledTimes(1);
    });

    it(`does NOT dispatch a CONNECTION_CHANGE action if the connection
    did not change`, () => {
      const wrapper = shallow<ReduxNetworkProvider>(
        <ReduxNetworkProvider {...getProps({ isConnected: true })} />
      );
      wrapper.instance().handleConnectivityChange(true);
      expect(props.connectionChange).not.toHaveBeenCalled();
    });
  });
});

describe("mapStateToProps", () => {
  it("maps isConnected and actionQueue state to props", () => {
    const networkState = {
      isConnected: false
    };
    const state = {
      network: networkState
    };
    expect(mapStateToProps(state)).toEqual(networkState);
  });
});
