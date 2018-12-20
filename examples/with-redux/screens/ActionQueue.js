import React, { Component } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addOneToCount } from "../actions";

class ActionQueueScreen extends Component {
  dispatchAddOneToCountAction = () => {
    this.props.addOneToCount();
    if (!this.props.isConnected) {
      Alert.alert(
        "Status",
        `You're offline the value of count will increase when connection is detected`
      );
    }
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View style={{ marginVertical: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Internet Connection Status :{" "}
            {this.props.isConnected ? "Online" : "Offline"}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Current Count: {this.props.count}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            height: 60,
            width: "80%",
            backgroundColor: "#007af5",
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30
          }}
          onPress={this.dispatchAddOneToCountAction}
        >
          <Text style={{ color: "white", fontSize: 20 }}>
            Add count action to queue if offline
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state, {
    isConnected: state.network.isConnected,
    count: state.reducers.count
  });
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addOneToCount }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActionQueueScreen);
