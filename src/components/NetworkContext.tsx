import { createContext } from 'react';

export type ConnectivityState = {
  isConnected: boolean,
};

const NetworkContext = createContext<ConnectivityState>({
  isConnected: true,
});

export default NetworkContext;
