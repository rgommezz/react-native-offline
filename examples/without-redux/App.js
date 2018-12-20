import React from "react";
import { createAppContainer } from "react-navigation";
import Navigator from "./navigation/MainNavigator";

export default class App extends React.Component {
  render() {
    const AppNavContainer = createAppContainer(Navigator);
    return <AppNavContainer />;
  }
}
