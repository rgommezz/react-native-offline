import React from 'react';

interface Context {
  toggleConnection: () => void;
  pingUrl: string;
}

const DummyNetworkContext = React.createContext<Context>(undefined);
export default DummyNetworkContext;
