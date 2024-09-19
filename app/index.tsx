// index.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image as RNImage } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from "./LoginScreen";
import SwipeScreen from './swipescreen';
import UserProfileScreen from './UserProfileScreen'; 
import CustomHeader from './customheader';
import LeaderBoardScreen from './LeaderBoard';
import SavedScreen from './SavedScreen';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MessagesScreen = () => <View style={styles.screen}><Text>Messages</Text></View>;

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee', paddingVertical: 20, paddingBottom: 20 },
      tabBarLabelStyle: { fontSize: 36 },
      headerTitle: () => <CustomHeader title={route.name} />, // Pass route name as title
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
      console.log('User state changed: ', user); // Add this line
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return <View style={styles.screen}><Text>Loading...</Text></View>;

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
      {/* Fallback screen in case none of the above conditions match */}
      <Stack.Screen
        name="Fallback"
        component={LoginScreen} // Or any other fallback screen
        options={{ headerShown: false }}
      />
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
