import React, { Component } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { checkInternetConnection } from "react-native-offline";

class OnDemand extends Component {
  checkInternetConnectivity = async () => {
    const isConnected = await checkInternetConnection(); //you can pass a timeout and a pingurl to it
    if (isConnected) {
      Alert.alert("Status", `You're connected to the internet`);
    } else {
      Alert.alert("Status", `You're not connected to the internet`);
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
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            height: 50,
            width: "80%",
            backgroundColor: "#007af5",
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30
          }}
          onPress={this.checkInternetConnectivity}
        >
          <Text style={{ fontSize: 19, color: "white" }}>
            Check Internet Connectivity
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default OnDemand;
