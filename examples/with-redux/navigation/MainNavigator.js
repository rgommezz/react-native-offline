import { createStackNavigator } from "react-navigation";
import MainApp from "../screens/Main";
import ReduxStateToPropsScreen from "../screens/ReduxStateToProp";
import ActionQueueScreen from "../screens/ActionQueue";

export default createStackNavigator({
  Home: {
    screen: MainApp,
    navigationOptions: {
      title: "React Native Offline Example App"
    }
  },
  WithRedux: {
    screen: ReduxStateToPropsScreen,
    navigationOptions: {
      title: "Redux Integration"
    }
  },
  ActionQueue: {
    screen: ActionQueueScreen,
    navigationOptions: {
      title: "Action Queue"
    }
  }
});
