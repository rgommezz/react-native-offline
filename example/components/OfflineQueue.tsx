import React, { FunctionComponent } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { AppState } from '../redux/createStore';

interface Props {
  queue: string[];
  title: string;
}
const OfflineQueue: FunctionComponent<Props> = ({ queue, title }) => {
  return (
    <View style={{ height: 90, marginVertical: 8 }}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.queue}
        horizontal
      >
        {queue.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Text style={styles.queueItem} key={`${item}-${index}`}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const mapStateToProps = ({ network }: AppState) => ({
  queue: network.actionQueue.map(a => ('type' in a ? a.type : 'Thunk')),
});

export default connect(mapStateToProps)(OfflineQueue);

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
    paddingBottom: 10,
  },
  queue: {
    backgroundColor: '#fbfbfb',
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  queueItem: {
    padding: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'orange',
    marginHorizontal: 4,
  },
});
