import React from "react";
import { withNetworkConnectivity } from "react-native-offline";
import { View, Text, Alert } from "react-native";
import Item from "../components/Item";

const buyIfOnline = () => {
  Alert.alert("You are online. You can proceed");
};

const buyIfOffline = () => {
  Alert.alert("You are offline. You cannot proceed");
};

const WithHOC = ({ isConnected }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    {/** Using this isConnected prop we can check if we are connected and perform actions based on that */}
    <Item onPress={isConnected ? buyIfOnline : buyIfOffline} />
    {/** Alternatively you can switch between the components to display based on isConnected */}
    {isConnected ? (
      <Text style={{ fontSize: 19 }}>You are connected to the internet :)</Text>
    ) : (
      <Text style={{ fontSize: 19 }}>You are not connected to the internet :(</Text>
    )}
  </View>
);

//You can also pass a config object containing your configurations to withNetworkConnectivity
export default withNetworkConnectivity({checkConnectionInterval:3000})(WithHOC);
