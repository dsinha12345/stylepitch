//MessageStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types'; // Import your types
import MessagesScreen from './Messages';
import ChatScreen from './Chat';

const Stack = createStackNavigator<RootStackParamList>();

const MessageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MessagesScreen" 
        component={MessagesScreen} 
        options={{headerShown:false}}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{headerShown:false}} 
      />
    </Stack.Navigator>
  );
};

export default MessageStack;

