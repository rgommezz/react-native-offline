import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

const ACTIVE_OPACITY = 0.8;

export default class MainApp extends React.Component {
  demoWithHOC = () => {
    this.props.navigation.navigate("HOC");
  };

  demoWithFACC = () => {
    this.props.navigation.navigate("FACC");
  };

  demoWithOnDemandChecks = () => {
    this.props.navigation.navigate("OnDemand");
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.sub_container_red}>
          <Text style={styles.demoText}>Higher Order Component</Text>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.tryItButton}
            onPress={this.demoWithHOC}
          >
            <Text style={styles.tryIt}>Try It!</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sub_container_green}>
          <Text style={styles.demoText}>
            Function as a Child Component
          </Text>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.tryItButton}
            onPress={this.demoWithFACC}
          >
            <Text style={styles.tryIt}>Try It!</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sub_container_blue}>
          <Text style={styles.demoText}>On Demand Intergration</Text>
          <TouchableOpacity
            activeOpacity={ACTIVE_OPACITY}
            style={styles.tryItButton}
            onPress={this.demoWithOnDemandChecks}
          >
            <Text style={styles.tryIt}>Try It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  demoText: { fontSize: 19, color: "white" },
  sub_container_red: {
    flex: 1,
    backgroundColor: "rgba(255,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  sub_container_green: {
    flex: 1,
    backgroundColor: "cyan",
    justifyContent: "center",
    alignItems: "center"
  },
  sub_container_blue: {
    flex: 1,
    backgroundColor: "rgba(0,0,255,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  tryIt: { color: "white", fontSize: 20 },
  tryItButton: {
    height: 50,
    width: "65%",
    backgroundColor: "#007af5",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30
  }
});
