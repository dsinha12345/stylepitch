// MainScreen.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, View, Image as RNImage } from 'react-native';
import LeaderBoardScreen from './LeaderBoard';
import SwipeScreen from './swipescreen';
import { UserProfileStack } from './UserProfileStack';
import { SavedScreenStack } from './SavedScreenStack';
import MessageStack from './MessagesStack';
import CustomHeader from './customheader';
import auth from '@react-native-firebase/auth';

const Tab = createBottomTabNavigator();

const handleLogout = () => {
  auth()
    .signOut()
    .then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    })
    .catch(error => {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    });
};


const MainScreen = () => (
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
      component={LeaderBoardScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/trophy.png')}
            style={{ width: 24, height: 24, backgroundColor: 'transparent' }}
          />
        ),
        tabBarLabel: "",
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
  </Tab.Navigator>
);

export default MainScreen;
