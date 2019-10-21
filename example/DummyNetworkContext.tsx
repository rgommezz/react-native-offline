import React from 'react';
type Context = {
  toggleConnection: () => void;
};
const DummyNetworkContext = React.createContext<Context>(
  (undefined as unknown) as Context,
);
export default DummyNetworkContext;
