import React from 'react';
import { Image as RNImage } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LeaderBoardScreenStack } from './LeaderBoardScreenStack';
import SwipeScreen from './Swipescreenwithregion';
import CustomHeader from './customheader';
import { UserProfileStack } from './UserProfileStack';
import { SavedScreenStack } from './SavedScreenStack';
import MessageStack from './MessagesStack';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import {AuthStackScreen} from './AuthStack';
const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  handleLogout: () => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ handleLogout }) => (
  <Tab.Navigator
    initialRouteName='Home'
    screenOptions={({ route }) => ({
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee', paddingVertical: 20 },
      tabBarLabelStyle: { fontSize: 16 },
      header: () => <CustomHeader title={route.name} onLogout={handleLogout} />,
    })}
  >
    <Tab.Screen
      name="LeaderBoard"
      component={LeaderBoardScreenStack}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/trophy.png')}
            style={{ width: 24, height: 24, backgroundColor: 'transparent' }}
          />
        ),
        tabBarLabel: "",
        headerShown: false
      }}
    />
    <Tab.Screen
      name="Messages"
      component={MessageStack}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/messages.png')}
            style={{ width: 36, height: 36, backgroundColor: 'transparent' }}
          />
        ),
        tabBarLabel: "",
        headerShown: false
      }}
    />
    <Tab.Screen
      name="Home"
      component={SwipeScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/hanger.png')}
            style={{ width: 36, height: 36, backgroundColor: 'transparent' }}
          />
        ),
        tabBarLabel: "",
      }}
    />
    <Tab.Screen
      name="Profile"
      component={UserProfileStack}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/user_icon.webp')}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
        ),
        tabBarLabel: "",
        headerShown: false
      }}
    />
    <Tab.Screen
      name="Saved"
      component={SavedScreenStack}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/saved.png')}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
        ),
        tabBarLabel: "",
        headerShown: false
      }}
    />
    <Tab.Screen
      name="Auth"
      component={AuthStackScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/hanger.png')} // Replace with your icon
            style={{ width: 24, height: 24 }}
          />
        ),
        tabBarLabel: "",
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

export default TabNavigator;