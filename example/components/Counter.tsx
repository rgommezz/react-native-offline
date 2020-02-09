import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import { MonoText } from './StyledText';
import { AppState } from '../redux/createStore';

const Counter: React.FC<{ counter: number }> = ({ counter }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter state:</Text>
      <View style={styles.value}>
        <MonoText style={styles.highlightText}>{counter}</MonoText>
      </View>
    </View>
  );
};

export default connect((state: AppState) => ({
  counter: state.counter,
}))(Counter);

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
    color: 'blue',
  },
});
