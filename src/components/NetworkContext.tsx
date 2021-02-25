import { createContext } from 'react';
import { ConnectivityState } from '../types';

const NetworkContext = createContext<ConnectivityState>({ isConnected: true });

export default NetworkContext;
