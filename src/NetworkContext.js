/* @flow */
import { createContext } from 'react';

const NetworkContext = createContext({
  isConnected: true,
});

export default NetworkContext;
