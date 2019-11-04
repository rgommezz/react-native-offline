import React from 'react';
type Context = {
  toggleConnection: () => void;
  pingUrl: string;
};
const DummyNetworkContext = React.createContext<Context>(
  ({} as unknown) as Context,
);
export default DummyNetworkContext;
