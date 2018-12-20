import React, { PureComponent } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default class Item extends PureComponent {
  render() {
    return (
      <View
        style={{
          flex: 1,
          width: "80%",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          style={{ width: 200, height: 200 }}
          source={{ uri: "https://www.primenewsghana.com/images/Waakye.jpg" }}
        />
        <Text style={{ fontSize: 18, paddingVertical: 20, fontWeight: "bold" }}>
          Price: GHS50
        </Text>
        <TouchableOpacity
          style={{
            height: 50,
            width: "65%",
            backgroundColor: "#007af5",
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20
          }}
          onPress={this.props.onPress}
        >
          <Text style={{ fontSize: 20, color: "white" }}>Buy It</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
