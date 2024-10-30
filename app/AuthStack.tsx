// AuthStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import { RootStackParamList } from './types'; // Adjust the path as necessary
const AuthStack = createStackNavigator<RootStackParamList>();

export const AuthStackScreen = () => (
  <AuthStack.Navigator initialRouteName="LoginScreen">
    <AuthStack.Screen 
      name="LoginScreen" 
      component={LoginScreen} 
      options={{ headerShown: false }} 
    />
    <AuthStack.Screen 
      name="ForgotPasswordScreen" 
      component={ForgotPasswordScreen} 
      options={{ title: 'Reset Password' }} 
    />
  </AuthStack.Navigator>
);
