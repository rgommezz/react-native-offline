import * as React from 'react';
import NetworkConnectivity from './NetworkConnectivity';
import NetworkContext from './NetworkContext';
import { ConnectivityArgs } from '../types';
import DEFAULT_ARGS from '../utils/defaultConnectivityArgs';

type Props = {
  children: React.ReactNode;
} & Partial<ConnectivityArgs>;

NetworkProvider.defaultProps = DEFAULT_ARGS;

function NetworkProvider(props: Props) {
  const { children, ...rest } = props;
  return (
    <NetworkConnectivity {...rest}>
      {connectionState => (
        <NetworkContext.Provider value={connectionState}>
          {children}
        </NetworkContext.Provider>
      )}
    </NetworkConnectivity>
  );
}

export default NetworkProvider;
