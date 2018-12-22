/* @flow */
import React from 'react';
import NetworkContext from './NetworkContext';

type TNetworkContext = ?{
  isConnected: boolean,
};

export default function NetworkConsumer() {
  return (
    <NetworkContext.Consumer>
      {(context: TNetworkContext) => {
        if (!context) {
          throw new Error(
            'NetworkConsumer components should be rendered within NetworkProvider. ' +
              'Make sure you are rendering a NetworkProvider at the top of your component hierarchy',
          );
        }
        return this.props.children({ isConnected: context.isConnected });
      }}
    </NetworkContext.Consumer>
  );
}
