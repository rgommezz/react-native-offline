import { createContext } from 'react';
import { ConnectivityState } from '../types';

const NetworkContext = createContext<ConnectivityState | undefined>(undefined);

export default NetworkContext;
