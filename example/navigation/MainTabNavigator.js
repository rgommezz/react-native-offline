import React from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SettingsScreen from '../screens/SettingsScreen';

const ComponentsStack = createStackNavigator({
  Components: ComponentsScreen,
});

ComponentsStack.navigationOptions = {
  tabBarLabel: 'Components',
  tabBarIcon: ({ focused }) => (
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
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
    />
  ),
};

export default createBottomTabNavigator({
  ComponentsStack,
  ReduxStack,
  SettingsStack,
});
