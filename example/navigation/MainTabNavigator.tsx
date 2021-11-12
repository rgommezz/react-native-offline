import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import TabBarIcon from '../components/TabBarIcon';
import ComponentsScreen from '../screens/ComponentsScreen';
import ReduxScreen from '../screens/ReduxScreen';
import SagasScreen from '../screens/SagasScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;

            if (route.name === 'Components') {
              iconName =
                Platform.OS === 'ios'
                  ? `ios-information-circle${focused ? '' : '-outline'}`
                  : 'md-information-circle';
            } else if (route.name === 'Redux') {
              iconName = Platform.OS === 'ios' ? 'ios-link' : 'md-link';
            } else if (route.name === 'Sagas') {
              iconName = Platform.OS === 'ios' ? 'ios-options' : 'md-options';
            }

            return <TabBarIcon focused={focused} name={iconName} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Components" component={ComponentsScreen} />
        <Tab.Screen name="Redux" component={ReduxScreen} />
        <Tab.Screen name="Sagas" component={SagasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
