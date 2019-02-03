import React from 'react';
import { connect } from 'react-redux';
import { Button, View, StyleSheet, Text } from 'react-native';
import { addOne, subOne, other, cancelOther } from '../redux/actions';

function ActionButtons({
  addOneAction,
  subOneAction,
  otherAction,
  cancelOtherAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions to dispatch:</Text>
      <View style={styles.row}>
        <Button onPress={addOneAction} title="ADD_1" color="#388E3C" />
        <Button onPress={subOneAction} title="SUB_1" color="#388E3C" />
      </View>
      <View style={styles.row}>
        <Button onPress={otherAction} title="OTHER" color="#388E3C" />
        <Button
          onPress={cancelOtherAction}
          title="CANCEL_OTHER"
          color="#388E3C"
        />
      </View>
    </View>
  );
}

export default connect(
  null,
  {
    addOneAction: addOne,
    subOneAction: subOne,
    otherAction: other,
    cancelOtherAction: cancelOther,
  },
)(ActionButtons);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  title: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
