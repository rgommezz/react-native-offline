import React from 'react';
import { Text } from 'react-native';
import { shallow } from 'react-native-testing-library';
import NetworkProvider from '../src/components/NetworkProvider';

describe('NetworkProvider', () => {
  it('has the correct structure and default props', () => {
    const { output } = shallow(
      <NetworkProvider>{() => <Text>Test</Text>}</NetworkProvider>,
    );
    expect(output).toMatchSnapshot();
  });
});
