import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SagasScreen from '../screens/SagasScreen';
import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.tintColor,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
        },
        headerStyle: {
          backgroundColor: Colors.tintColor,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Components"
        component={ComponentsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconName: IoniconsName = Platform.OS === 'ios'
              ? focused
                ? 'ios-information-circle'
                : 'ios-information-circle-outline'
              : 'md-information-circle';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Redux"
        component={ReduxScreen}
        options={{
          tabBarIcon: ({ color, size }) => {
            const iconName: IoniconsName = Platform.OS === 'ios' ? 'ios-link' : 'md-link';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Sagas"
        component={SagasScreen}
        options={{
          tabBarIcon: ({ color, size }) => {
            const iconName: IoniconsName = Platform.OS === 'ios' ? 'ios-options' : 'md-options';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}
