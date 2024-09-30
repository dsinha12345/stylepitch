//app.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, Image as RNImage } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import LoginScreen from './LoginScreen';
import UserDesigns from './UserDesigns';
import UploadDesignScreen from './UploadDesignScreen';
import LeaderBoardScreen from './LeaderBoard';
import SwipeScreen from './swipescreen';
import UserProfileScreen from './UserProfileScreen';
import SavedScreen from './SavedScreen';
import CustomHeader from './customheader';
import ProfileScreen from './Profile';
import CardDetailScreen from './CardDetailScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MessagesScreen = () => <View style={styles.screen}><Text>Messages</Text></View>;

const handleLogout = () => {
  auth()
    .signOut()
    .then(() => {
      Alert.alert('Logged out', 'You have been logged out successfully.');
    })
    .catch(error => {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    });
};

const TabNavigator = () => (
  <Tab.Navigator
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
      component={MessagesScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/messages.png')}
            style={{ width: 36, height: 36, backgroundColor: 'transparent' }}
          />
        ),
        tabBarLabel: "",
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
      component={UserProfileScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/user_icon.webp')}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
        ),
        tabBarLabel: "",
      }}
    />
    <Tab.Screen
      name="Saved"
      component={SavedScreen}
      options={{
        tabBarIcon: () => (
          <RNImage
            source={require('../assets/saved.png')}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
        ),
        tabBarLabel: "",
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserDesigns"
              component={UserDesigns}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UploadDesignScreen"
              component={UploadDesignScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CardDetailScreen"
              component={CardDetailScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
