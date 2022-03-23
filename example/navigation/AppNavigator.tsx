import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';
import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SagasScreen from '../screens/SagasScreen';

const Tab = createBottomTabNavigator();

type TabBarIconArgs = {
  focused: boolean;
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name='Home'
          component={ComponentsScreen}
          options={{
            tabBarIcon: ({ focused }: TabBarIconArgs) => (
              <TabBarIcon
                focused={focused}
                name={
                  Platform.OS === 'ios'
                    ? `ios-information-circle${focused ? '' : '-outline'}`
                    : 'md-information-circle'
                }
              />
            )
          }}
        />
        <Tab.Screen
          name='Redux'
          component={ReduxScreen}
          options={{
            tabBarIcon: ({ focused }: TabBarIconArgs) => (
              <TabBarIcon
                focused={focused}
                name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
              />
            )
          }}
        />
        <Tab.Screen
          name='Sagas'
          component={SagasScreen}
          options={{
            tabBarIcon: ({ focused }: TabBarIconArgs) => (
              <TabBarIcon
                focused={focused}
                name={Platform.OS === 'ios' ? 'ios-options' : 'md-options'}
              />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
