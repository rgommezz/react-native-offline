import React from 'react';
import { Text } from 'react-native';
import { shallow } from 'react-native-testing-library';
import NetworkProvider from '../src/components/NetworkProvider';

describe('NetworkProvider', () => {
  it('has the correct structure and default props', () => {
    const { output } = shallow(
      <NetworkProvider
        pingInBackground
        httpMethod="HEAD"
        pingInterval={2000}
        pingOnlyIfOffline
        pingServerUrl="whatever"
        pingTimeout={1000}
        shouldPing
      >
        {() => <Text>Test</Text>}
      </NetworkProvider>,
    );
    expect(output).toMatchSnapshot();
  });
});
