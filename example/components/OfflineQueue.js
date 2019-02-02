import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';

function OfflineQueue({ queue }) {
  console.log(queue);
  return (
    <View>
      <Text style={styles.tabBarInfoText}>Offline Queue</Text>
      <View style={styles.queue}>
        {queue.map((item, i) => (
          <Text key={`${item}-${i}`}>{item}</Text>
        ))}
      </View>
    </View>
  );
}

const mapStateToProps = ({ network }) => ({
  queue: network.actionQueue.map(a => a.type),
});

export default connect(mapStateToProps)(OfflineQueue);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  queue: {
    height: 40,
    width: '100%',
  },
});
