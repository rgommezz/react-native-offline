import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Text } from 'react-native';
import { MonoText } from './StyledText';

function ReduxNetworkReader({ isConnected }) {
  return (
    <React.Fragment>
      <Text style={styles.title}>Connected to Internet:</Text>
      <View style={styles.container}>
        <MonoText style={styles.highlightText}>
          {isConnected ? 'YES' : 'NO'}
        </MonoText>
      </View>
    </React.Fragment>
  );
}

export default connect(store => ({
  isConnected: store.network.isConnected,
}))(ReduxNetworkReader);

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
    marginVertical: 7,
  },
  highlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
});
