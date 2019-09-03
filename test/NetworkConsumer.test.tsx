import React from 'react';
import { Text } from 'react-native';
import { render } from 'react-native-testing-library';
import NetworkConsumer from '../src/components/NetworkConsumer';
import NetworkProvider from '../src/components/NetworkProvider';

const getElement = ({ props = {}, children = null } = {}) => (
  <NetworkProvider {...props}>{children}</NetworkProvider>
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
