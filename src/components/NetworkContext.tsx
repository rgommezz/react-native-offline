import { createContext } from "react";

export type ConnectivityState = {
  isConnected: boolean;
};

const NetworkContext = createContext<ConnectivityState>(undefined as any);

export default NetworkContext;
