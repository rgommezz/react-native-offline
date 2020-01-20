import React, { ReactNode } from 'react';
import NetworkContext from './NetworkContext';
import { ConnectivityState } from '../types';

type Props = {
  children: (args: ConnectivityState) => ReactNode;
};

export default function NetworkConsumer({ children }: Props) {
  return (
    <NetworkContext.Consumer>
      {context => {
        if (!context) {
          throw new Error(
            'NetworkConsumer components should be rendered within NetworkProvider. ' +
              'Make sure you are rendering a NetworkProvider at the top of your component hierarchy',
          );
        }
        return children(context);
      }}
    </NetworkContext.Consumer>
  );
}
