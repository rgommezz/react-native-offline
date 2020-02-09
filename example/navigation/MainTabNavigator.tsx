import React from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SagasScreen from '../screens/SagasScreen';

const ComponentsStack = createStackNavigator({
  Components: ComponentsScreen,
});

type TabBarIconArgs = {
  focused: boolean;
};

ComponentsStack.navigationOptions = {
  tabBarLabel: 'Components',
  tabBarIcon: ({ focused }: TabBarIconArgs) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const ReduxStack = createStackNavigator({
  Redux: ReduxScreen,
});

ReduxStack.navigationOptions = {
  tabBarLabel: 'Redux',
  tabBarIcon: ({ focused }: TabBarIconArgs) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const SagasStack = createStackNavigator({
  Sagas: SagasScreen,
});

SagasStack.navigationOptions = {
  tabBarLabel: 'Sagas',
  tabBarIcon: ({ focused }: TabBarIconArgs) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default createBottomTabNavigator({
  ComponentsStack,
  ReduxStack,
  SagasStack,
});
