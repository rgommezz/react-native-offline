import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import { MonoText } from './StyledText';

function Counter({ counter }) {
  return (
    <React.Fragment>
      <Text style={styles.title}>Counter state:</Text>
      <View style={styles.container}>
        <MonoText style={styles.highlightText}>{counter}</MonoText>
      </View>
    </React.Fragment>
  );
}

export default connect(state => ({
  counter: state.counter,
}))(Counter);

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
    color: 'blue',
  },
});
