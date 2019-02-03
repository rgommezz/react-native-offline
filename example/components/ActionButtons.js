import React from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  View,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { addOne, subOne, other, cancelOther } from '../redux/actions';

const Touchable = Platform.select({
  android: TouchableNativeFeedback,
  ios: TouchableOpacity,
});

const showInfo = actionType => () => {
  const message = (() => {
    switch (actionType) {
      case 'ADD_1':
        return (
          'This action adds 1 to the counter state. It is configured to be enqueued if offline ' +
          'and  uses a unique id per action, so that we can add to the queue as many as we want.'
        );
      case 'SUB_1':
        return (
          'This action subtracts 1 to the counter state. It is configured to be enqueued if offline ' +
          'and uses a unique id per action, so that we can add to the queue as many as we want.'
        );
      case 'OTHER':
        return (
          "This action does not change the UI state. It's only purpose is to demonstrate that if we dispatch the same " +
          'action to the queue several times, it will replace the existing one and a new instance to the end of the queue. ' +
          "It's also dismissable, so that if an action with type CANCEL_OTHER is dispatched, it will be removed from the queue."
        );
      case 'CANCEL_OTHER':
        return (
          "This action does not change the UI state and it's NOT configured to be added to the offline queue." +
          ' If dispatched, it will dismiss actions from the queue with type OTHER.'
        );
      default:
        return '';
    }
  })();
  Alert.alert(actionType, message, [{ text: 'OK', onPress: () => ({}) }], {
    cancelable: false,
  });
};

function ActionButtons({
  addOneAction,
  subOneAction,
  otherAction,
  cancelOtherAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions to dispatch</Text>
      <Text style={styles.subtitle}>Long tap on each action for more info</Text>
      <View style={styles.row}>
        <Touchable
          onPress={addOneAction}
          onLongPress={showInfo('ADD_1')}
          style={{ justifyContent: 'center', marginHorizontal: 8 }}
        >
          <Text style={styles.button}>ADD_1</Text>
        </Touchable>
        <Touchable
          onPress={subOneAction}
          onLongPress={showInfo('SUB_1')}
          style={{ justifyContent: 'center', marginHorizontal: 8 }}
        >
          <Text style={styles.button}>SUB_1</Text>
        </Touchable>
      </View>
      <View style={styles.row}>
        <Touchable
          onPress={otherAction}
          onLongPress={showInfo('OTHER')}
          style={{ justifyContent: 'center', marginHorizontal: 8 }}
        >
          <Text style={styles.button}>OTHER</Text>
        </Touchable>
        <Touchable
          onPress={cancelOtherAction}
          onLongPress={showInfo('CANCEL_OTHER')}
          style={{ justifyContent: 'center', marginHorizontal: 8 }}
        >
          <Text style={styles.button}>CANCEL_OTHER</Text>
        </Touchable>
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  row: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 8,
  },
  button: {
    color: '#388E3C',
    fontSize: 18,
  },
});
