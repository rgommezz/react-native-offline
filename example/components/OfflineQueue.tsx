import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';

function OfflineQueue({ queue, title }) {
  return (
    <View style={{ height: 90, marginVertical: 8 }}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.queue}
        horizontal
      >
        {queue.map((item, i) => (
          <Text style={styles.queueItem} key={`${item}`}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const mapStateToProps = ({ network }) => ({
  queue: network.actionQueue.map(a => a.type),
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
