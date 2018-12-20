import { createStackNavigator } from "react-navigation";
import MainApp from "../screens/Main";
import WithHOCScreen from "../screens/HOC";
import WithFACCScreen from "../screens/FACC";
import CheckOnDemandScreen from "../screens/OnDemand";

export default createStackNavigator({
  Home: {
    screen: MainApp,
    navigationOptions: {
      title: "React Native Offline Example App"
    }
  },
  HOC: {
    screen: WithHOCScreen,
    navigationOptions: {
      title: "Using a High Order Component"
    }
  },
  FACC: {
    screen: WithFACCScreen,
    navigationOptions: {
      title: "Using a High Order Component"
    }
  },
  OnDemand: {
    screen: CheckOnDemandScreen,
    navigationOptions: {
      title: "Check on demand"
    }
  }
});
