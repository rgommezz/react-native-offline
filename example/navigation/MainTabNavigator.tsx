import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';
import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SagasScreen from '../screens/SagasScreen';
import Colors from '../constants/Colors';

export type RootTabParamList = {
  Components: undefined;
  Redux: undefined;
  Sagas: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof TabBarIcon>['name'] =
            'information-circle';
          if (route.name === 'Components') {
            iconName = focused
              ? 'information-circle'
              : 'information-circle-outline';
          } else if (route.name === 'Redux') {
            iconName = 'link';
          } else {
            iconName = focused ? 'options' : 'options-outline';
          }
          return <TabBarIcon focused={focused} name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen
        name="Components"
        component={ComponentsScreen}
        options={{ title: 'Components' }}
      />
      <Tab.Screen
        name="Redux"
        component={ReduxScreen}
        options={{ title: 'Redux' }}
      />
      <Tab.Screen
        name="Sagas"
        component={SagasScreen}
        options={{ title: 'Sagas' }}
      />
    </Tab.Navigator>
  );
}
