import React from 'react';
import { Button } from 'react-native';
import DummyNetworkContext from '../DummyNetworkContext';

function ConnectionToggler() {
  return (
    <DummyNetworkContext.Consumer>
      {({ toggleConnection }) => (
        <Button
          onPress={toggleConnection}
          title="Toggle Internet connection"
          color="#841584"
        />
      )}
    </DummyNetworkContext.Consumer>
  );
}

export default ConnectionToggler;
