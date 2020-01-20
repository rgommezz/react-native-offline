import { createContext } from 'react';
import { ConnectivityState } from '../types';

const NetworkContext = createContext<ConnectivityState>(undefined as any);

export default NetworkContext;
