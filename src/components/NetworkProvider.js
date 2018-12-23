/* @flow */
import React from 'react';
import NetworkConnectivity from './NetworkConnectivity';
import NetworkContext from './NetworkContext';
import type { HTTPMethod } from '../types';
import {
  DEFAULT_HTTP_METHOD,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_TIMEOUT,
} from '../utils/constants';

type ConnectivityState = {
  isConnected: boolean,
};

type Props = {
  timeout?: number,
  pingServerUrl?: string,
  shouldPing?: boolean,
  pingInterval?: number,
  pingOnlyIfOffline?: boolean,
  pingInBackground?: boolean,
  httpMethod?: HTTPMethod,
};

NetworkProvider.defaultProps = {
  timeout: DEFAULT_TIMEOUT,
  pingServerUrl: DEFAULT_PING_SERVER_URL,
  shouldPing: true,
  pingInterval: 0,
  pingOnlyIfOffline: false,
  pingInBackground: false,
  httpMethod: DEFAULT_HTTP_METHOD,
};

function NetworkProvider(props: Props) {
  const { children, ...rest } = props;
  return (
    <NetworkConnectivity {...rest}>
      {(connectionState: ConnectivityState) => (
        <NetworkContext.Provider value={connectionState}>
          {children}
        </NetworkContext.Provider>
      )}
    </NetworkConnectivity>
  );
}

export default NetworkProvider;
