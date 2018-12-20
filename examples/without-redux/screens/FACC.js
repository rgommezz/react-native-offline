import React, { Component } from "react";
import { View, Text, Alert } from "react-native";
import { ConnectivityRenderer } from "react-native-offline";
import Item from "../components/Item";

class FunctionAsAChildComponent extends Component {
  buyIfOnline = () => {
    Alert.alert("You are online. You can proceed");
  };

  buyIfOffline = () => {
    Alert.alert("You are offline. You cannot proceed");
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
        {/** You can add as many components and place the ones that depend on internet connection inside the ConnectivityRenderer component */}
        <View
          style={{
            height: 30,
            backgroundColor: "rgba(255,0,0,0.4)",
            marginTop: 10
          }}
        >
          <Text style={{ fontSize: 18 }}>I dont care about your connectivity</Text>
        </View>
        <ConnectivityRenderer>
          {isConnected => (
            //Using this isConnected prop we can check if we are connected and perform actions based on that
            <Item
              onPress={isConnected ? this.buyIfOnline : this.buyIfOffline}
            />
          )}
        </ConnectivityRenderer>
        <ConnectivityRenderer>
          {isConnected =>
            // Alternatively you can switch between the components to displaybased on isConnected return
            isConnected ? (
              <Text style={{ fontSize: 19 }}>
                You are connected to the internet :)
              </Text>
            ) : (
              <Text style={{ fontSize: 19 }}>
                You are not connected to the internet :(
              </Text>
            )
          }
        </ConnectivityRenderer>
      </View>
    );
  }
}

export default FunctionAsAChildComponent;
