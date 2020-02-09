import React from 'react';

interface Context {
  toggleConnection: () => void;
  pingUrl: string;
}

const DummyNetworkContext = React.createContext<Partial<Context>>({});
export default DummyNetworkContext;
