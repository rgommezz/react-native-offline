import React from "react";
import { createAppContainer } from "react-navigation";
import Navigator from "./navigation/MainNavigator";
import { Provider } from "react-redux";
import {store} from "./store";

export default class App extends React.Component {
  render() {
    const AppNavContainer = createAppContainer(Navigator);

    return (
      <Provider store={store}>
        <AppNavContainer />
      </Provider>
    );
  }
}
