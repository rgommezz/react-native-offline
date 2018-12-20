import React, { Component } from "react";
import { View, Text, Alert } from "react-native";
import Item from "../components/Item";
import { connect } from "react-redux";

class ReduxStateToProps extends Component {
  buyIfOnline = () => {
    Alert.alert("Status", "You are online. You can proceed");
  };

  buyIfOffline = () => {
    Alert.alert("Status", "You are offline. You cannot proceed");
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
          <Text style={{ fontSize: 18 }}>
            I dont care about your connectivity
          </Text>
        </View>
        {/** Using this isConnected prop we can check if we are connected and perform actions based on that*/}
        <Item
          onPress={
            this.props.isConnected ? this.buyIfOnline : this.buyIfOffline
          }
        />

        {/** Alternatively you can switch between the components to displaybased on isConnected return*/}
        {this.props.isConnected ? (
          <Text style={{ fontSize: 19 }}>
            You are connected to the internet :)
          </Text>
        ) : (
          <Text style={{ fontSize: 19 }}>
            You are not connected to the internet :(
          </Text>
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state, {
    isConnected: state.network.isConnected
  });
}

export default connect(
  mapStateToProps,
  null
)(ReduxStateToProps);
