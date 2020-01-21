import * as React from 'react';
import NetworkConnectivity from './NetworkConnectivity';
import NetworkContext from './NetworkContext';
import { ConnectivityArgs } from '../types';
import { DEFAULT_ARGS } from '../utils/constants';

type Props = {
  children: React.ReactNode;
} & ConnectivityArgs;

function NetworkProvider({
  httpMethod = DEFAULT_ARGS.httpMethod,
  pingInBackground = DEFAULT_ARGS.pingInBackground,
  pingInterval = DEFAULT_ARGS.pingInterval,
  pingOnlyIfOffline = DEFAULT_ARGS.pingOnlyIfOffline,
  pingServerUrl = DEFAULT_ARGS.pingServerUrl,
  pingTimeout = DEFAULT_ARGS.pingTimeout,
  shouldPing = DEFAULT_ARGS.shouldPing,
  children,
}: Partial<Props>) {
  return (
    <NetworkConnectivity
      {...{
        httpMethod,
        pingInBackground,
        pingInterval,
        pingOnlyIfOffline,
        pingServerUrl,
        pingTimeout,
        shouldPing,
      }}
    >
      {connectionState => (
        <NetworkContext.Provider value={connectionState}>
          {children}
        </NetworkContext.Provider>
      )}
    </NetworkConnectivity>
  );
}

export default NetworkProvider;
