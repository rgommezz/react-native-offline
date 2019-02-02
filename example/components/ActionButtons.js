import React from 'react';
import { connect } from 'react-redux';
import { Button, View } from 'react-native';
import { addOne, subOne, noUI } from '../redux/actions';

function ActionButtons({ addOneAction, subOneAction, noUIAction }) {
  return (
    <View>
      <Button onPress={addOneAction} title="ADD 1" color="#388E3C" />
      <Button onPress={subOneAction} title="SUB 1" color="#388E3C" />
      <Button onPress={noUIAction} title="NO UI" color="#388E3C" />
    </View>
  );
}

export default connect(
  null,
  { addOneAction: addOne, subOneAction: subOne, noUIAction: noUI },
)(ActionButtons);
