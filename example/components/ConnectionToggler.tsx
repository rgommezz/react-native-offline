import React from 'react';
import { Button, View } from 'react-native';
import DummyNetworkContext from '../DummyNetworkContext';

function ConnectionToggler() {
  return (
    <DummyNetworkContext.Consumer>
      {({ toggleConnection }) => (
        <View style={{ marginBottom: 20 }}>
          <Button
            onPress={() => toggleConnection()}
            title="Toggle Internet connection"
            color="#841584"
          />
        </View>
      )}
    </DummyNetworkContext.Consumer>
  );
}

export default ConnectionToggler;
