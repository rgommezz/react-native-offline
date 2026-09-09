import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './MainTabNavigator';

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
}
