import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Text } from 'react-native';
import { MonoText } from './StyledText';
import { AppState } from '../redux/createStore';

type Props = {
  isConnected: boolean;
};
const ReduxNetworkReader: FunctionComponent<Props> = ({ isConnected }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected to Internet:</Text>
      <View style={styles.value}>
        <MonoText
          style={[
            styles.highlightText,
            { color: isConnected ? 'green' : 'red' },
          ]}
        >
          {isConnected ? 'YES' : 'NO'}
        </MonoText>
      </View>
    </View>
  );
};

export default connect((state: AppState) => ({
  isConnected: state.network.isConnected,
}))(ReduxNetworkReader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
    marginVertical: 7,
  },
  highlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
});
